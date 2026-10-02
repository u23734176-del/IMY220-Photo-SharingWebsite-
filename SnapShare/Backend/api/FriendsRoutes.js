// Routes to handle the Firneds Reuqests 

const express = require("express");
const router = express.Router();

const {sendFriendRequest , respondToFriendRequest , getPendingRequests , getFriendsList , removeFriend } = require("./FriendsLogic");

//Send Friend Request (/api/friends/request)
router.post("/friends/request", async (req, res) => {
  try {
    const { senderUsername, receiverUsername } = req.body;
    const result = await sendFriendRequest(senderUsername, receiverUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      request: result.request
    });
  } catch (error) {
    console.error("Send Friend Request Error:", error);
    return res.status(500).json({ error: "Internal server error while sending friend request." });
  }
});

///api/friends/respond - Accept or Decline Friend Request
router.post("/friends/respond", async (req, res) => {
  try {
    const { requestId, action, responderUsername } = req.body;
    const result = await respondToFriendRequest(requestId, action, responderUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Respond Friend Request Error:", error);
    return res.status(500).json({ error: "Internal server error while responding to friend request." });
  }
});
//// GET /api/friends/requests/:username - View Pending Friend Requests
router.get("/friends/requests/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getPendingRequests(username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      requests: result.requests
    });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching pending requests." });
  }
});
//// GET /api/friends/:username - Get Confirmed Friends List
router.get("/friends/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getFriendsList(username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      count: result.count,
      friends: result.friends
    });
  } catch (error) {
    console.error("Get Friends List Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching friends list." });
  }
});

// DELETE /api/friends/remove - Unfriend / Remove Friend
router.delete("/friends/remove", async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    const result = await removeFriend(username, friendUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Remove Friend Error:", error);
    return res.status(500).json({ error: "Internal server error while removing friend." });
  }
});


module.exports = router;
