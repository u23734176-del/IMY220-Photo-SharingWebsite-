// PostLogic.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../database");

// Parse a raw hashtag string or array into an array of "#tag" strings
function parseHashtags(rawHashtags) {
  if (Array.isArray(rawHashtags)) {
    return rawHashtags
      .map((tag) => String(tag).trim())
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

// Adds the frontend-friendly fields (author, caption, image) to a single post
async function withAuthor(post) {
  const author = await getDB()
    .collection("Users")
    .findOne({ _id: post.userID }, { projection: { username: 1 } });

  return {
    ...post,
    author: author?.username || "Unknown",
    caption: post.captions,
    image: post.imageURL
  };
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

  const newPost = {
    userID: user._id,
    imageURL: imageURL || "../assets/logo.png",
    captions: caption,
    createdAt: new Date(),
    likes: 0,
    likedBy: [],
    comments: [],
    albumID: albumID && ObjectId.isValid(albumID) ? new ObjectId(albumID) : null,
    category: category || "Nature",
    hashTags: parseHashtags(hashTags),
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
    post: await withAuthor({ _id: result.insertedId, ...newPost })
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
    post: await withAuthor(updatedPost)
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

  return { success: true, status: 200, message: "Post deleted successfully!" };
}

// Fetch all posts (feed), joining the author's username in one query
async function getAllPosts() {
  const db = getDB();
  const posts = await db.collection("Posts").aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "Users",
        localField: "userID",
        foreignField: "_id",
        as: "authorDoc"
      }
    },
    {
      $addFields: {
        author: { $ifNull: [{ $arrayElemAt: ["$authorDoc.username", 0] }, "Unknown"] },
        caption: "$captions",
        image: "$imageURL"
      }
    },
    { $project: { authorDoc: 0 } }
  ]).toArray();

  return { success: true, status: 200, posts };
}

// Fetch single post by ID
async function getPostById(postId) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }

  const post = await getDB().collection("Posts").findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  return { success: true, status: 200, post: await withAuthor(post) };
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

  const rawPosts = await db
    .collection("Posts")
    .find({ userID: user._id })
    .sort({ createdAt: -1 })
    .toArray();

  const posts = rawPosts.map((p) => ({
    ...p,
    author: user.username,
    caption: p.captions,
    image: p.imageURL
  }));

  return { success: true, status: 200, posts };
}

// Like / unlike a Post (one like per user, tracked in likedBy)
async function likePost(postId, username, action = "like") {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }
  if (!username || !String(username).trim()) {
    return { success: false, status: 400, message: "You must be logged in to like a post." };
  }

  const postsCollection = getDB().collection("Posts");
  const _id = new ObjectId(postId);
  const name = String(username).trim();

  const post = await postsCollection.findOne({ _id });
  if (!post) {
    return { success: false, status: 404, message: "Post not found." };
  }

  if (action === "unlike") {
    // Only decrements if this user had actually liked it
    await postsCollection.updateOne(
      { _id, likedBy: name },
      { $inc: { likes: -1 }, $pull: { likedBy: name } }
    );
  } else {
    // Only increments if this user hasn't already liked it
    await postsCollection.updateOne(
      { _id, likedBy: { $ne: name } },
      { $inc: { likes: 1 }, $addToSet: { likedBy: name } }
    );
  }

  const updated = await postsCollection.findOne({ _id });
  const likedBy = updated.likedBy || [];

  return {
    success: true,
    status: 200,
    message: "Like updated.",
    likes: updated.likes || 0,
    likedBy,
    liked: likedBy.includes(name)
  };
}

// Comment on a Post
async function commentOnPost(postId, username, commentText) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }
  if (!username || !commentText || !String(commentText).trim()) {
    return { success: false, status: 400, message: "Username and comment text are required." };
  }

  const db = getDB();
  const user = await db.collection("Users").findOne({ username: username.trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const commentObj = {
    _id: new ObjectId(),
    username: user.username,
    comment: String(commentText).trim(),
    createdAt: new Date()
  };

  const postsCollection = db.collection("Posts");
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

// Report Post (Admin only)
async function reportPost(postId, adminUsername, reportMessage) {
  if (!postId || !ObjectId.isValid(postId)) {
    return { success: false, status: 400, message: "Valid Post ID is required." };
  }
  if (!adminUsername) {
    return { success: false, status: 400, message: "Admin username is required." };
  }

  const db = getDB();
  const adminUser = await db.collection("Users").findOne({ username: adminUsername.trim() });
  if (!adminUser || !adminUser.admin) {
    return { success: false, status: 403, message: "Access denied. Only administrators can report posts." };
  }

  const postsCollection = db.collection("Posts");
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
    post: await withAuthor(updatedPost)
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