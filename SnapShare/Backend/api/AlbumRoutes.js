// AlbumRoutes.js
const express = require("express");
const router = express.Router();
const { createAlbum, editAlbum, deleteAlbum,  getUserAlbums} = require("./AlbumLogic");

// POST /api/albums - Create Album
router.post("/albums", async (req, res) => {
  try {
    const { username, title, description, postsIDs } = req.body;
    const result = await createAlbum(username, { title, description, postsIDs });

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      album: result.album
    });
  } catch (error) {
    console.error("Create Album Error:", error);
    return res.status(500).json({ error: "Internal server error while creating album." });
  }
});

// PUT /api/albums/:albumId - Edit Album
router.put("/albums/:albumId", async (req, res) => {
  try {
    const { albumId } = req.params;
    const { username, title, description, postsIDs } = req.body;

    const result = await editAlbum(albumId, username, { title, description, postsIDs });

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      album: result.album
    });
  } catch (error) {
    console.error("Edit Album Error:", error);
    return res.status(500).json({ error: "Internal server error while editing album." });
  }
});

// DELETE /api/albums/:albumId - Delete Album
router.delete("/albums/:albumId", async (req, res) => {
  try {
    const { albumId } = req.params;
    const { username } = req.body;

    const result = await deleteAlbum(albumId, username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Delete Album Error:", error);
    return res.status(500).json({ error: "Internal server error while deleting album." });
  }
});

// GET /api/albums/:username - Fetch User's Albums
router.get("/albums/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getUserAlbums(username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      albums: result.albums
    });
  } catch (error) {
    console.error("Get User Albums Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching user albums." });
  }
});

module.exports = router;