// FriendsLogic.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../database");

// Matches "pending" regardless of how older documents capitalised it
const PENDING = { $in: ["pending", "Pending"] };

// Search users by username / first name / surname
async function searchUsers(query) {
  const q = String(query || "").trim();
  if (!q) {
    return { success: true, status: 200, users: [] };
  }

  // Escape regex special characters so "_" "." etc. are matched literally
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const users = await getDB()
    .collection("Users")
    .find(
      { $or: [{ username: regex }, { firstname: regex }, { surname: regex }] },
      { projection: { password: 0 } }
    )
    .limit(20)
    .toArray();

  return { success: true, status: 200, users };
}

// Send Friend Request
async function sendFriendRequest(senderUsername, receiverUsername) {
  if (!senderUsername || !receiverUsername) {
    return { success: false, status: 400, message: "Sender and receiver usernames are required." };
  }

  if (senderUsername.trim().toLowerCase() === receiverUsername.trim().toLowerCase()) {
    return { success: false, status: 400, message: "You cannot send a friend request to yourself." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const friendsCollection = db.collection("Friends");

  const sender = await usersCollection.findOne({ username: senderUsername.trim() });
  const receiver = await usersCollection.findOne({ username: receiverUsername.trim() });

  if (!sender) {
    return { success: false, status: 404, message: "Sender user profile not found." };
  }
  if (!receiver) {
    return { success: false, status: 404, message: "Receiver user profile not found." };
  }

  // Already friends? (skip null entries left in the array)
  const alreadyFriends = (sender.friendsListID || []).some(
    (id) => id && id.toString() === receiver._id.toString()
  );
  if (alreadyFriends) {
    return { success: false, status: 400, message: "Users are already friends." };
  }

  // Existing pending request between these users?
  const existingRequest = await friendsCollection.findOne({
    $or: [
      { senderID: sender._id, receiverID: receiver._id },
      { senderID: receiver._id, receiverID: sender._id }
    ],
    status: PENDING
  });

  if (existingRequest) {
    return { success: false, status: 400, message: "A pending friend request already exists between these users." };
  }

  const newRequest = {
    senderID: sender._id,
    receiverID: receiver._id,
    status: "pending",
    createdAt: new Date()
  };

  const result = await friendsCollection.insertOne(newRequest);

  return {
    success: true,
    status: 201,
    message: `Friend request sent to ${receiver.username}.`,
    request: {
      _id: result.insertedId,
      senderUsername: sender.username,
      receiverUsername: receiver.username,
      status: "pending",
      createdAt: newRequest.createdAt
    }
  };
}

// Accept OR decline a Friend Request
async function respondToFriendRequest(requestId, action, responderUsername) {
  if (!requestId || !action || !responderUsername) {
    return { success: false, status: 400, message: "Request ID, action, and responder username are required." };
  }

  const cleanAction = action.trim().toLowerCase();
  if (!["accept", "decline"].includes(cleanAction)) {
    return { success: false, status: 400, message: "Action must be either 'accept' or 'decline'." };
  }

  if (!ObjectId.isValid(requestId)) {
    return { success: false, status: 400, message: "Invalid request ID format." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const friendsCollection = db.collection("Friends");

  const responder = await usersCollection.findOne({ username: responderUsername.trim() });
  if (!responder) {
    return { success: false, status: 404, message: "Responder user not found." };
  }

  const friendReq = await friendsCollection.findOne({ _id: new ObjectId(requestId) });
  if (!friendReq) {
    return { success: false, status: 404, message: "Friend request not found." };
  }

  if (!friendReq.receiverID || friendReq.receiverID.toString() !== responder._id.toString()) {
    return { success: false, status: 403, message: "You are not authorized to respond to this friend request." };
  }

  if (String(friendReq.status).toLowerCase() !== "pending") {
    return { success: false, status: 400, message: `This request has already been ${friendReq.status}.` };
  }

  if (cleanAction === "accept") {
    await friendsCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: "accepted" } }
    );

    // Add each user's ObjectId to the other's friendsListID
    await usersCollection.updateOne(
      { _id: friendReq.senderID },
      { $addToSet: { friendsListID: friendReq.receiverID } }
    );
    await usersCollection.updateOne(
      { _id: friendReq.receiverID },
      { $addToSet: { friendsListID: friendReq.senderID } }
    );

    return { success: true, status: 200, message: "Friend request accepted successfully." };
  }

  await friendsCollection.updateOne(
    { _id: new ObjectId(requestId) },
    { $set: { status: "declined" } }
  );

  return { success: true, status: 200, message: "Friend request declined." };
}

// Pending incoming Friend Requests for a User
async function getPendingRequests(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const friendsCollection = db.collection("Friends");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const requests = await friendsCollection.find({
    receiverID: user._id,
    status: PENDING
  }).toArray();

  // Skip malformed documents (e.g. ones using "sender" instead of "senderID")
  const validRequests = requests.filter((req) => req.senderID);
  const senderIDs = validRequests.map((req) => req.senderID);

  const senders = await usersCollection.find(
    { _id: { $in: senderIDs } },
    { projection: { password: 0 } }
  ).toArray();

  const senderMap = new Map(senders.map((s) => [s._id.toString(), s]));

  const pendingRequests = validRequests.map((req) => ({
    requestId: req._id,
    createdAt: req.createdAt,
    sender: senderMap.get(req.senderID.toString()) || null
  }));

  return { success: true, status: 200, requests: pendingRequests };
}

// Confirmed friends list
async function getFriendsList(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const usersCollection = getDB().collection("Users");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  // Drop null / invalid entries so they never reach the query
  const friendObjectIds = (user.friendsListID || []).filter(Boolean);

  const friends = await usersCollection.find(
    { _id: { $in: friendObjectIds } },
    { projection: { password: 0 } }
  ).toArray();

  return { success: true, status: 200, count: friends.length, friends };
}

// Remove a friend
async function removeFriend(username, friendUsername) {
  if (!username || !friendUsername) {
    return { success: false, status: 400, message: "Both usernames are required to remove a friend." };
  }

  const usersCollection = getDB().collection("Users");

  const user = await usersCollection.findOne({ username: username.trim() });
  const friend = await usersCollection.findOne({ username: friendUsername.trim() });

  if (!user || !friend) {
    return { success: false, status: 404, message: "One or both user profiles were not found." };
  }

  await usersCollection.updateOne(
    { _id: user._id },
    { $pull: { friendsListID: friend._id } }
  );

  await usersCollection.updateOne(
    { _id: friend._id },
    { $pull: { friendsListID: user._id } }
  );

  return {
    success: true,
    status: 200,
    message: `Successfully removed ${friend.username} from your friends list.`
  };
}

module.exports = {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend
};