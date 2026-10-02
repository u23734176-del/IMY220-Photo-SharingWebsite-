// PostLogic.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../database");

// Helper to parse raw hashtag string or array into a standard array of strings with '#' prefix 
function parseHashtags(rawHashtags) {
  if (Array.isArray(rawHashtags)) {
    return rawHashtags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }
  if (typeof rawHashtags === "string") {
    return rawHashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }
  return [];
}

// Create a new Post
async function createPost(username, postData = {}) {
  if (!username) {
    return { success: false, status: 400, message: "Username is required to create a post." };
  }

  const { imageURL, caption, category, albumID, hashTags } = postData;

  if (!caption) {
    return { success: false, status: 400, message: "Caption is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const formattedHashtags = parseHashtags(hashTags);

  const newPost = {
    userID: user._id,
    imageURL: imageURL || "../assets/logo.png",
    captions: caption,
    createdAt: new Date(),
    likes: 0,
    comments: [],
    albumID: albumID && ObjectId.isValid(albumID) ? new ObjectId(albumID) : null,
    category: category || "Nature",
    hashTags: formattedHashtags,
    reported: false,
    reportMessage: ""
  };

  const result = await postsCollection.insertOne(newPost);

  await usersCollection.updateOne(
    { _id: user._id },
    { $addToSet: { postIDs: result.insertedId } }
  );

  return {
    success: true,
    status: 201,
    message: "Post created successfully!",
    post: {
      _id: result.insertedId,
      ...newPost
    }
  };
}

// Edit an existing Post
async function editPost(postId, username, updateData = {}) {
  if (!postId || !username) {
    return { success: false, status: 400, message: "Post ID and username are required." };
  }

  if (!ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Invalid Post ID format." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  if (post.userID.toString() !== user._id.toString() && !user.admin) {
    return { success: false, status: 403, message: "You are not authorized to edit this post." };
  }

  const fieldsToUpdate = {};
  if (updateData.caption !== undefined) fieldsToUpdate.captions = updateData.caption;
  if (updateData.imageURL !== undefined) fieldsToUpdate.imageURL = updateData.imageURL;
  if (updateData.category !== undefined) fieldsToUpdate.category = updateData.category;
  if (updateData.hashTags !== undefined) {
    fieldsToUpdate.hashTags = parseHashtags(updateData.hashTags);
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return { success: false, status: 400, message: "No valid fields provided for update." };
  }

  await postsCollection.updateOne(
    { _id: new ObjectId(postId) },
    { $set: fieldsToUpdate }
  );

  const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

  return {
    success: true,
    status: 200,
    message: "Post updated successfully!",
    post: updatedPost
  };
}

// Delete a Post
async function deletePost(postId, username) {
  if (!postId || !username) {
    return { success: false, status: 400, message: "Post ID and username are required." };
  }

  if (!ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Invalid Post ID format." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  if (post.userID.toString() !== user._id.toString() && !user.admin) {
    return { success: false, status: 403, message: "You are not authorized to delete this post." };
  }

  await postsCollection.deleteOne({ _id: new ObjectId(postId) });

  await usersCollection.updateOne(
    { _id: post.userID },
    { $pull: { postIDs: new ObjectId(postId) } }
  );

  return {
    success: true,
    status: 200,
    message: "Post deleted successfully!"
  };
}

// Fetch all posts feed
async function getAllPosts() {
  const db = getDB();
  const posts = await db.collection("Posts").find({}).sort({ createdAt: -1 }).toArray();
  return { success: true, status: 200, posts };
}

// Fetch single post by ID
async function getPostById(postId) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }

  const db = getDB();
  const post = await db.collection("Posts").findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  return { success: true, status: 200, post };
}

// Fetch posts by username
async function getPostsByUsername(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const user = await db.collection("Users").findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const posts = await db.collection("Posts").find({ userID: user._id }).sort({ createdAt: -1 }).toArray();

  return { success: true, status: 200, posts };
}

// Like a Post (increments like counter)
async function likePost(postId, username) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }

  const db = getDB();
  const postsCollection = db.collection("Posts");

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  await postsCollection.updateOne(
    { _id: new ObjectId(postId) },
    { $inc: { likes: 1 } }
  );

  const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

  return {
    success: true,
    status: 200,
    message: "Post liked successfully!",
    likes: updatedPost.likes
  };
}

// Comment on a Post
async function commentOnPost(postId, username, commentText) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }

  if (!username || !commentText || !commentText.trim()) {
    return { success: false, status: 400, message: "Username and comment text are required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const commentObj = {
    _id: new ObjectId(),
    username: user.username,
    comment: commentText.trim(),
    createdAt: new Date()
  };

  await postsCollection.updateOne(
    { _id: new ObjectId(postId) },
    { $push: { comments: commentObj } }
  );

  const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

  return {
    success: true,
    status: 200,
    message: "Comment added successfully!",
    comments: updatedPost.comments
  };
}

// Report Post for issues (Admin only)
async function reportPost(postId, adminUsername, reportMessage) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }

  if (!adminUsername) {
    return { success: false, status: 400, message: "Admin username is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const postsCollection = db.collection("Posts");

  const adminUser = await usersCollection.findOne({ username: adminUsername.trim() });
  if (!adminUser || !adminUser.admin) {
    return { success: false, status: 403, message: "Access denied. Only administrators can report posts." };
  }

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  await postsCollection.updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        reported: true,
        reportMessage: reportMessage ? reportMessage.trim() : "Flagged for content review."
      }
    }
  );

  const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

  return {
    success: true,
    status: 200,
    message: "Post reported successfully by admin.",
    post: updatedPost
  };
}

module.exports = {
  createPost,
  editPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUsername,
  likePost,
  commentOnPost,
  reportPost
};