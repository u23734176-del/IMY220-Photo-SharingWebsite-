// AlbumLogic.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../database");

// Strict 24-character hex check (ObjectId.isValid also accepts any 12-char string)
const HEX_24 = /^[0-9a-fA-F]{24}$/;
const isValidId = (value) => HEX_24.test(String(value ?? ""));

// List of ids -> unique ObjectIds, dropping anything invalid
function toUniqueObjectIds(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of list) {
    const id = String(raw ?? "");
    if (isValidId(id) && !seen.has(id)) {
      seen.add(id);
      result.push(new ObjectId(id));
    }
  }
  return result;
}

// Keep only the post ids that really belong to this user
async function filterOwnedPostIds(userId, rawIds) {
  const ids = toUniqueObjectIds(rawIds);
  if (ids.length === 0) return [];

  const owned = await getDB()
    .collection("Posts")
    .find({ _id: { $in: ids }, userID: userId }, { projection: { _id: 1 } })
    .toArray();

  const ownedSet = new Set(owned.map((p) => p._id.toString()));
  return ids.filter((id) => ownedSet.has(id.toString()));
}

// Create a new Album
async function createAlbum(username, albumData = {}) {
  if (!username) {
    return { success: false, status: 400, message: "Username is required." };
  }

  const { title, description, postsIDs } = albumData;

  if (typeof title !== "string" || !title.trim()) {
    return { success: false, status: 400, message: "Album title is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const albumsCollection = db.collection("Albums");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: String(username).trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  // Only the user's own, valid posts can go into their album
  const validPostObjectIds = await filterOwnedPostIds(user._id, postsIDs);

  const newAlbum = {
    userID: user._id,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    postsIDs: validPostObjectIds,
    createdAt: new Date()
  };

  const result = await albumsCollection.insertOne(newAlbum);

  // Link album ID into user's albumsIDs array
  await usersCollection.updateOne(
    { _id: user._id },
    { $addToSet: { albumsIDs: result.insertedId } }
  );

  // Link album ID to respective post documents in Posts collection
  if (validPostObjectIds.length > 0) {
    await postsCollection.updateMany(
      { _id: { $in: validPostObjectIds } },
      { $set: { albumID: result.insertedId } }
    );
  }

  return {
    success: true,
    status: 201,
    message: "Album created successfully!",
    album: {
      _id: result.insertedId,
      ...newAlbum
    }
  };
}

// Edit an existing Album
async function editAlbum(albumId, username, updateData = {}) {
  if (!albumId || !username) {
    return { success: false, status: 400, message: "Album ID and username are required." };
  }

  if (!isValidId(albumId)) {
    return { success: false, status: 400, message: "Invalid Album ID format." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const albumsCollection = db.collection("Albums");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: String(username).trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const albumObjId = new ObjectId(albumId);
  const album = await albumsCollection.findOne({ _id: albumObjId });

  if (!album) {
    return { success: false, status: 404, message: "Album not found." };
  }

  // Authorize album owner or admin
  if (album.userID.toString() !== user._id.toString() && !user.admin) {
    return { success: false, status: 403, message: "You are not authorized to edit this album." };
  }

  const fieldsToUpdate = {};

  if (updateData.title !== undefined) {
    if (typeof updateData.title !== "string" || !updateData.title.trim()) {
      return { success: false, status: 400, message: "Album title cannot be empty." };
    }
    fieldsToUpdate.title = updateData.title.trim();
  }

  if (updateData.description !== undefined) {
    fieldsToUpdate.description =
      typeof updateData.description === "string" ? updateData.description.trim() : "";
  }

  if (updateData.postsIDs !== undefined) {
    // Posts must belong to the album's owner
    const validPostObjectIds = await filterOwnedPostIds(album.userID, updateData.postsIDs);

    fieldsToUpdate.postsIDs = validPostObjectIds;

    // Remove albumID reference from posts previously in this album
    await postsCollection.updateMany(
      { albumID: albumObjId },
      { $set: { albumID: null } }
    );

    // Set albumID reference for posts currently in this album
    if (validPostObjectIds.length > 0) {
      await postsCollection.updateMany(
        { _id: { $in: validPostObjectIds } },
        { $set: { albumID: albumObjId } }
      );
    }
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return { success: false, status: 400, message: "No valid fields provided for update." };
  }

  await albumsCollection.updateOne(
    { _id: albumObjId },
    { $set: fieldsToUpdate }
  );

  const updatedAlbum = await albumsCollection.findOne({ _id: albumObjId });

  return {
    success: true,
    status: 200,
    message: "Album updated successfully!",
    album: updatedAlbum
  };
}

// Delete an Album
async function deleteAlbum(albumId, username) {
  if (!albumId || !username) {
    return { success: false, status: 400, message: "Album ID and username are required." };
  }

  if (!isValidId(albumId)) {
    return { success: false, status: 400, message: "Invalid Album ID format." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const albumsCollection = db.collection("Albums");
  const postsCollection = db.collection("Posts");

  const user = await usersCollection.findOne({ username: String(username).trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const albumObjId = new ObjectId(albumId);
  const album = await albumsCollection.findOne({ _id: albumObjId });

  if (!album) {
    return { success: false, status: 404, message: "Album not found." };
  }

  // Authorize album owner or admin
  if (album.userID.toString() !== user._id.toString() && !user.admin) {
    return { success: false, status: 403, message: "You are not authorized to delete this album." };
  }

  // Delete album document
  await albumsCollection.deleteOne({ _id: albumObjId });

  // Remove album reference from user's albumsIDs array
  await usersCollection.updateOne(
    { _id: album.userID },
    { $pull: { albumsIDs: albumObjId } }
  );

  // Clear albumID reference in posts that belonged to this album
  await postsCollection.updateMany(
    { albumID: albumObjId },
    { $set: { albumID: null } }
  );

  return {
    success: true,
    status: 200,
    message: "Album deleted successfully!"
  };
}

// Get all albums for a given user (newest first)
async function getUserAlbums(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const usersCollection = db.collection("Users");
  const albumsCollection = db.collection("Albums");

  const user = await usersCollection.findOne({ username: String(username).trim() });
  if (!user) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const albums = await albumsCollection
    .find({ userID: user._id })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    success: true,
    status: 200,
    albums
  };
}

module.exports = {
  createAlbum,
  editAlbum,
  deleteAlbum,
  getUserAlbums
};