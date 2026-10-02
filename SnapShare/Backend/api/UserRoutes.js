// routes/UserRoutes.js
const express = require("express");
const router = express.Router();
const { getDB } = require("../database");

// GET /api/users/search?q=query
router.get("/users/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({ users: [] });
    }

    const db = getDB();
    const searchRegex = new RegExp(q.trim(), "i");

    // Search by username, firstname, or surname
    const users = await db.collection("Users").find(
      {
        $or: [
          { username: searchRegex },
          { firstname: searchRegex },
          { surname: searchRegex }
        ]
      },
      { projection: { password: 0 } } // Omit password hash from results
    ).toArray();

    return res.status(200).json({ users });
  } catch (error) {
    console.error("User Search Error:", error);
    return res.status(500).json({ error: "Internal server error while searching users." });
  }
});

module.exports = router;