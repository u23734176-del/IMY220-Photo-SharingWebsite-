// APILogic.js / PorfilesLogic.js
const { getDB } = require("../database");

// Login Logic
async function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, status: 400, message: "Username and password are required." };
  }
  const db = getDB();
  const collection = db.collection("Users");
  const userMatch = await collection.findOne({ username: username.trim() });

  if (!userMatch) {
    return {
      success: false,
      status: 401,
      message: "Username does not exist."
    };
  }

  if (userMatch.password !== password) {
    return {
      success: false,
      status: 401,
      message: "Incorrect password entered."
    };
  }

  const { password: _, ...userWithoutPassword } = userMatch;
  return { 
    success: true,
    status: 200,
    message: "Login successful!",
    user: userWithoutPassword 
  };
}

// Sign Up Logic
async function signUp(userData = {}) {
  const { username, email, password, firstname, surname, bio, pronouns, profilePicture } = userData || {};

  if (!username || !email || !password) {
    return {
      success: false,
      status: 400,
      message: "Username, email, and password are required."
    };
  }

  const db = getDB();
  const collection = db.collection("Users");

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  const existingUsername = await collection.findOne({ username: cleanUsername });
  if (existingUsername) {
    return {
      success: false,
      status: 400,
      message: "Username is already taken."
    };
  }

  const existingEmailAddress = await collection.findOne({ email: cleanEmail });
  if (existingEmailAddress) {
    return {
      success: false,
      status: 400,
      message: "Email is already in use."
    };
  }

  const newUser = {
    username: cleanUsername,
    password: password,
    email: cleanEmail,
    admin: false,
    profilePicture: profilePicture || "../",
    bio: bio || "",
    firstname: firstname || "",
    surname: surname || "",
    pronouns: pronouns || "",
    postIDs: [],
    albumsIDs: [],
    friendsListID: []
  };

  const result = await collection.insertOne(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  return {
    success: true,
    status: 201,
    message: "Sign-up successful!",
    user: {
      _id: result.insertedId,
      ...userWithoutPassword
    }
  };
}

// Log Out Logic
async function logoutUser(username) {
  return {
    success: true,
    status: 200,
    message: `Logout successful${username ? ` for user: ${username}` : ""}.`
  };
}

// Fetch profile data by username (used for both own profile & viewing other users' profiles)
async function getProfile(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const collection = db.collection("Users");

  const userMatch = await collection.findOne({ username: username.trim() });

  if (!userMatch) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const { password: _, ...userWithoutPassword } = userMatch;

  return {
    success: true,
    status: 200,
    user: userWithoutPassword
  };
}

// Update editable Profile details
async function updateProfile(username, updateData = {}) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const db = getDB();
  const collection = db.collection("Users");

  const cleanUsername = username.trim();
  const userMatch = await collection.findOne({ username: cleanUsername });

  if (!userMatch) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const { firstname, surname, bio, pronouns, profilePicture } = updateData;

  const fieldsToUpdate = {};
  if (firstname !== undefined) fieldsToUpdate.firstname = firstname;
  if (surname !== undefined) fieldsToUpdate.surname = surname;
  if (bio !== undefined) fieldsToUpdate.bio = bio;
  if (pronouns !== undefined) fieldsToUpdate.pronouns = pronouns;
  if (profilePicture !== undefined) fieldsToUpdate.profilePicture = profilePicture;

  if (Object.keys(fieldsToUpdate).length === 0) {
    return { success: false, status: 400, message: "No valid fields provided to update." };
  }

  await collection.updateOne(
    { username: cleanUsername },
    { $set: fieldsToUpdate }
  );

  const updatedUser = await collection.findOne({ username: cleanUsername });
  const { password: _, ...userWithoutPassword } = updatedUser;

  return {
    success: true,
    status: 200,
    message: "Profile updated successfully!",
    user: userWithoutPassword
  };
}

// Delete Profile (Allows self-deletion without admin, OR deletion performed by Admin)
async function deleteProfile(targetUsername, requesterUsername) {
  if (!targetUsername) {
    return { success: false, status: 400, message: "Target username parameter is required." };
  }

  const cleanTarget = targetUsername.trim();
  const cleanRequester = requesterUsername ? requesterUsername.trim() : cleanTarget;

  const db = getDB();
  const collection = db.collection("Users");

  const requester = await collection.findOne({ username: cleanRequester });
  if (!requester) {
    return { success: false, status: 404, message: "Requester profile not found." };
  }

  const targetUser = await collection.findOne({ username: cleanTarget });
  if (!targetUser) {
    return { success: false, status: 404, message: "User profile to delete was not found." };
  }

  // Allow deletion if the user is deleting their own profile OR if the requester is an admin
  const isSelfDelete = requester.username === targetUser.username;
  const isAdmin = requester.admin === true;

  if (!isSelfDelete && !isAdmin) {
    return { 
      success: false, 
      status: 403, 
      message: "Access denied. You can only delete your own profile unless you are an administrator." 
    };
  }

  await collection.deleteOne({ username: cleanTarget });

  return {
    success: true,
    status: 200,
    message: isSelfDelete
      ? `Your profile '${cleanTarget}' has been successfully deleted.`
      : `Profile for user '${cleanTarget}' has been successfully deleted by admin '${requester.username}'.`
  };
}

module.exports = { 
  loginUser,
  signUp,
  logoutUser,
  getProfile,
  updateProfile,
  deleteProfile
};