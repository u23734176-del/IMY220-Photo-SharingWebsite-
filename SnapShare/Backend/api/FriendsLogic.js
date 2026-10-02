//  API Logic for the friends File
const { ObjectId } = require("mongodb"); //feature for Object If

const { getDB } = require("../database");


//send Friend Request Api
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

  // Check if already friends
  const alreadyFriends = sender.friendsListID?.some((id) => id.toString() === receiver._id.toString());
  if (alreadyFriends) {
    return { success: false, status: 400, message: "Users are already friends." };
  }

  // Check for an existing request between these users
  const existingRequest = await friendsCollection.findOne({
    $or: [
      { senderID: sender._id, receiverID: receiver._id },
      { senderID: receiver._id, receiverID: sender._id }
    ],
    status: "pending"
  });

  if (existingRequest) {
    return { success: false, status: 400, message: "A pending friend request already exists between these users." };
  }
  // Create friend request
  const newRequest = { senderID: sender._id, receiverID: receiver._id,  status: "pending",  createdAt: new Date() };

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

// Accept OR decline Friend Requests
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

  if (friendReq.receiverID.toString() !== responder._id.toString()) {
    return { success: false, status: 403, message: "You are not authorized to respond to this friend request." };
  }

  if (friendReq.status !== "pending") {
    return { success: false, status: 400, message: `This request has already been ${friendReq.status}.` };
  }

  if (cleanAction === "accept") {
    // Update request status
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

    return {
      success: true,
      status: 200,
      message: "Friend request accepted successfully."
    };
  } else {
    // Decline request
    await friendsCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: "declined" } }
    );

    return {
      success: true,
      status: 200,
      message: "Friend request declined."
    };
  }
}

//Pending incoming Friend Requests for a User
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
    status: "pending"
  }).toArray();

  const senderIDs = requests.map((req) => req.senderID);
  const senders = await usersCollection.find(
    { _id: { $in: senderIDs } },
    { projection: { password: 0 } }
  ).toArray();

  const senderMap = new Map(senders.map((s) => [s._id.toString(), s]));

  const pendingRequests = requests.map((req) => ({
    requestId: req._id,
    createdAt: req.createdAt,
    sender: senderMap.get(req.senderID.toString()) || null
  }));

  return {
    success: true,
    status: 200,
    requests: pendingRequests
  };
}
//Add User to the Friend List in the Databse Collection 
async function getFriendsList(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const friendObjectIds = user.friendsListID || [];

  const friends = await usersCollection.find(
    { _id: { $in: friendObjectIds } },
    { projection: { password: 0 } }
  ).toArray();

  return {
    success: true,
    status: 200,
    count: friends.length,
    friends: friends
  };
}

//Rmove the Friends
async function removeFriend(username, friendUsername) {
  if (!username || !friendUsername) {
    return { success: false, status: 400, message: "Both usernames are required to remove a friend." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");

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
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend
};