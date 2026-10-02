// PostRoutes.js
// PostRoutes.js
const express = require("express");
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

// POST /api/posts - Create Post
router.post("/posts", async (req, res) => {
  try {
    const { username, imageURL, caption, category, albumID, hashTags } = req.body;
    const result = await createPost(username, {
      imageURL,
      caption,
      category,
      albumID,
      hashTags
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      post: result.post
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({ error: "Internal server error while creating post." });
  }
});

// PUT /api/posts/:postId - Edit Post
router.put("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username, caption, imageURL, category, hashTags } = req.body;

    const result = await editPost(postId, username, {
      caption,
      imageURL,
      category,
      hashTags
    });

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

// DELETE /api/posts/:postId - Delete Post
router.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    const result = await deletePost(postId, username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({ error: "Internal server error while deleting post." });
  }
});

// GET /api/posts - Get All Posts Feed
router.get("/posts", async (req, res) => {
  try {
    const result = await getAllPosts();
    return res.status(result.status).json({ posts: result.posts });
  } catch (error) {
    console.error("Get Posts Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching posts." });
  }
});

// GET /api/posts/user/:username - View Posts by Username
router.get("/posts/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getPostsByUsername(username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ posts: result.posts });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching user posts." });
  }
});

// GET /api/posts/:postId - View Single Post
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await getPostById(postId);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ post: result.post });
  } catch (error) {
    console.error("Get Post By ID Error:", error);
    return res.status(500).json({ error: "Internal server error while fetching post." });
  }
});

// POST /api/posts/:postId/like - Like a Post
router.post("/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    const result = await likePost(postId, username);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      likes: result.likes
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    return res.status(500).json({ error: "Internal server error while liking post." });
  }
});

// POST /api/posts/:postId/comment - Comment on a Post
router.post("/posts/:postId/comment", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username, comment } = req.body;

    const result = await commentOnPost(postId, username, comment);

    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({
      message: result.message,
      comments: result.comments
    });
  } catch (error) {
    console.error("Comment Post Error:", error);
    return res.status(500).json({ error: "Internal server error while commenting on post." });
  }
});

// PUT /api/posts/:postId/report - Report Post (Admin only)
router.put("/posts/:postId/report", async (req, res) => {
  try {
    const { postId } = req.params;
    const { adminUsername, reportMessage } = req.body;

    const result = await reportPost(postId, adminUsername, reportMessage);

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
