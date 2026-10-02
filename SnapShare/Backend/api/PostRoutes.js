// PostRoutes.js
const express = require("express");
const fs = require("fs");
const router = express.Router();
const {
  createPost,
  editPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUsername,
  likePost,
  commentOnPost,
  reportPost
} = require("./PostLogic");
const { uploadSingleImage } = require("./upload");

// GET /api/posts  (global feed)
router.get("/posts", async (req, res) => {
  try {
    const result = await getAllPosts();
    return res.status(result.status).json({ posts: result.posts });
  } catch (error) {
    console.error("Get All Posts Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching posts." });
  }
});

// GET /api/posts/user/:username  (must be declared BEFORE /posts/:id)
router.get("/posts/user/:username", async (req, res) => {
  try {
    const result = await getPostsByUsername(req.params.username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ posts: result.posts });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching user posts." });
  }
});

// GET /api/posts/:id
router.get("/posts/:id", async (req, res) => {
  try {
    const result = await getPostById(req.params.id);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ post: result.post });
  } catch (error) {
    console.error("Get Post Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching post." });
  }
});

// POST /api/posts  (create)
// multipart/form-data fields: username, caption, category, hashTags, image (file)
// A plain imageURL text field (or a JSON body) still works when no file is sent.
router.post("/posts", uploadSingleImage, async (req, res) => {
  // If the post is not saved, don't leave the uploaded file on disk
  const removeUploadedFile = () => {
    if (req.file) fs.unlink(req.file.path, () => {});
  };

  try {
    const { username, ...postData } = req.body || {};

    if (req.file) {
      postData.imageURL = `/uploads/${req.file.filename}`;
    }

    const result = await createPost(username, postData);

    if (!result.success) {
      removeUploadedFile();
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      post: result.post
    });
  } catch (error) {
    removeUploadedFile();
    console.error("Create Post Error:", error);
    return res.status(500).json({ error: "Internal server error while creating post." });
  }
});

// PUT /api/posts/:id  (edit)
router.put("/posts/:id", async (req, res) => {
  try {
    const { username, ...updateData } = req.body || {};
    const result = await editPost(req.params.id, username, updateData);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      post: result.post
    });
  } catch (error) {
    console.error("Edit Post Error:", error);
    return res.status(500).json({ error: "Internal server error while editing post." });
  }
});

// DELETE /api/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    const { username } = req.body || {};
    const result = await deletePost(req.params.id, username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({ error: "Internal server error while deleting post." });
  }
});

// POST /api/posts/:id/like  (body: { username, action: "like" | "unlike" })
router.post("/posts/:id/like", async (req, res) => {
  try {
    const { username, action } = req.body || {};
    const result = await likePost(req.params.id, username, action);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      likes: result.likes,
      likedBy: result.likedBy,
      liked: result.liked
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    return res.status(500).json({ error: "Internal server error while updating like." });
  }
});

// POST /api/posts/:id/comment  (body: { username, comment })
router.post("/posts/:id/comment", async (req, res) => {
  try {
    const { username, comment } = req.body || {};
    const result = await commentOnPost(req.params.id, username, comment);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      comments: result.comments
    });
  } catch (error) {
    console.error("Comment Error:", error);
    return res.status(500).json({ error: "Internal server error while commenting." });
  }
});

// POST /api/posts/:id/report  (admin only)
// NOTE: match this path/body to whatever ReportButton.jsx actually sends.
router.post("/posts/:id/report", async (req, res) => {
  try {
    const { username, adminUsername, reportMessage } = req.body || {};
    const result = await reportPost(req.params.id, adminUsername || username, reportMessage);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      post: result.post
    });
  } catch (error) {
    console.error("Report Post Error:", error);
    return res.status(500).json({ error: "Internal server error while reporting post." });
  }
});

module.exports = router;