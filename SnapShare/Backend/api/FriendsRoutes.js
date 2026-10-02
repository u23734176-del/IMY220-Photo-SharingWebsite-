// FriendsRoutes.js
const express = require("express");
const router = express.Router();
const {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend
} = require("./FriendsLogic");

// GET /api/users/search?q=term
router.get("/users/search", async (req, res) => {
  try {
    const result = await searchUsers(req.query.q);
    return res.status(result.status).json({ users: result.users });
  } catch (error) {
    console.error("Search Users Error:", error);
    return res.status(500).json({ error: "Internal server error while searching users." });
  }
});

// POST /api/friends/request  (body: { senderUsername, receiverUsername })
router.post("/friends/request", async (req, res) => {
  try {
    const { senderUsername, receiverUsername } = req.body || {};
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

// POST /api/friends/respond  (body: { requestId, action: "accept" | "decline", responderUsername })
router.post("/friends/respond", async (req, res) => {
  try {
    const { requestId, action, responderUsername } = req.body || {};
    const result = await respondToFriendRequest(requestId, action, responderUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Respond Friend Request Error:", error);
    return res.status(500).json({ error: "Internal server error while responding to friend request." });
  }
});

// DELETE /api/friends/remove  (body: { username, friendUsername })
router.delete("/friends/remove", async (req, res) => {
  try {
    const { username, friendUsername } = req.body || {};
    const result = await removeFriend(username, friendUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Remove Friend Error:", error);
    return res.status(500).json({ error: "Internal server error while removing friend." });
  }
});

// GET /api/friends/requests/:username  (pending incoming requests)
router.get("/friends/requests/:username", async (req, res) => {
  try {
    const result = await getPendingRequests(req.params.username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ requests: result.requests });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching friend requests." });
  }
});

// GET /api/friends/:username  (confirmed friends)
router.get("/friends/:username", async (req, res) => {
  try {
    const result = await getFriendsList(req.params.username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      count: result.count,
      friends: result.friends
    });
  } catch (error) {
    console.error("Get Friends List Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching friends." });
  }
});

module.exports = router;