// This file handles the routes for the APi
// APIRoutes.js / PorfileRoutes.js

const express = require("express");
const router = express.Router();
const {
  loginUser,
  signUp,
  logoutUser,
  getProfile,
  updateProfile,
  deleteProfile,
  searchUsers
} = require("./PorfilesLogic");

// Login API
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// Sign Up API route
router.post("/signUp", async (req, res) => {
  try {
    const result = await signUp(req.body);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Internal server error during sign-up." });
  }
});

// Log Out Route
router.post("/logout", async (req, res) => {
  try {
    const { username } = req.body || {};
    const result = await logoutUser(username);

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ error: "Internal server error during logout." });
  }
});

// GET /api/users/search?q=term  (search users by username / first name / surname)
router.get("/users/search", async (req, res) => {
  try {
    const result = await searchUsers(req.query.q);
    return res.status(result.status).json({ users: result.users });
  } catch (error) {
    console.error("Search Users Error:", error);
    return res.status(500).json({ error: "Internal server error while searching users." });
  }
});

// GET /api/profile/:username (View Own Profile OR View Other Users' Profiles)
router.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getProfile(username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      user: result.user
    });
  } catch (error) {
    console.error("View Profile Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching profile." });
  }
});

// PUT /api/profile/:username (Edit Profile)
router.put("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { requesterUsername, ...updateData } = req.body || {};

    const result = await updateProfile(username, updateData, requesterUsername);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ error: "Internal server error while updating profile." });
  }
});

// DELETE /api/profile/:username (Delete Profile - self or admin)
router.delete("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { requesterUsername } = req.body || {};

    // Defaults requester to target username if no requester specified (Self-deletion)
    const result = await deleteProfile(username, requesterUsername || username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(500).json({ error: "Internal server error while deleting profile." });
  }
});

module.exports = router;