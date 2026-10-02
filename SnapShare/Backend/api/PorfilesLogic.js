// PorfilesLogic.js
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
    return { success: false, status: 401, message: "Username does not exist." };
  }

  if (userMatch.password !== password) {
    return { success: false, status: 401, message: "Incorrect password entered." };
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
    return { success: false, status: 400, message: "Username, email, and password are required." };
  }

  const db = getDB();
  const collection = db.collection("Users");

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  const existingUsername = await collection.findOne({ username: cleanUsername });
  if (existingUsername) {
    return { success: false, status: 400, message: "Username is already taken." };
  }

  const existingEmailAddress = await collection.findOne({ email: cleanEmail });
  if (existingEmailAddress) {
    return { success: false, status: 400, message: "Email is already in use." };
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
    user: { _id: result.insertedId, ...userWithoutPassword }
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

// Fetch profile data by username (own profile or another user's)
async function getProfile(username) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }

  const collection = getDB().collection("Users");
  const userMatch = await collection.findOne({ username: username.trim() });

  if (!userMatch) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const { password: _, ...userWithoutPassword } = userMatch;
  return { success: true, status: 200, user: userWithoutPassword };
}

// Update Profile details (self, or an admin editing someone else)
async function updateProfile(username, updateData = {}, requesterUsername) {
  if (!username) {
    return { success: false, status: 400, message: "Username parameter is required." };
  }
  if (!requesterUsername) {
    return { success: false, status: 400, message: "Requester username is required." };
  }

  const collection = getDB().collection("Users");

  const userMatch = await collection.findOne({ username: username.trim() });
  if (!userMatch) {
    return { success: false, status: 404, message: "User profile not found." };
  }

  const requester = await collection.findOne({ username: String(requesterUsername).trim() });
  if (!requester) {
    return { success: false, status: 404, message: "Requester profile not found." };
  }

  const isSelf = requester._id.equals(userMatch._id);
  if (!isSelf && !requester.admin) {
    return { success: false, status: 403, message: "You can only edit your own profile." };
  }

  const editable = ["username", "email", "password", "firstname", "surname", "bio", "pronouns", "profilePicture"];
  if (!editable.some((key) => updateData[key] !== undefined)) {
    return { success: false, status: 400, message: "No valid fields provided to update." };
  }

  const { username: newUsername, email, password, firstname, surname, bio, pronouns, profilePicture } = updateData;
  const fieldsToUpdate = {};

  // Username (must be unique)
  if (newUsername !== undefined) {
    const cleanNew = String(newUsername).trim();
    if (!cleanNew) {
      return { success: false, status: 400, message: "Username cannot be empty." };
    }
    if (cleanNew !== userMatch.username) {
      const taken = await collection.findOne({ username: cleanNew });
      if (taken) {
        return { success: false, status: 400, message: "Username is already taken." };
      }
      fieldsToUpdate.username = cleanNew;
    }
  }

  // Email (must be valid and unique)
  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, status: 400, message: "A valid email address is required." };
    }
    if (cleanEmail !== userMatch.email) {
      const taken = await collection.findOne({ email: cleanEmail });
      if (taken) {
        return { success: false, status: 400, message: "Email is already in use." };
      }
      fieldsToUpdate.email = cleanEmail;
    }
  }

  // Password (only the account owner can change it)
  if (password !== undefined) {
    if (!isSelf) {
      return { success: false, status: 403, message: "Only the account owner can change the password." };
    }
    if (String(password).length < 6) {
      return { success: false, status: 400, message: "Password must be at least 6 characters." };
    }
    fieldsToUpdate.password = String(password);
  }

  if (firstname !== undefined) fieldsToUpdate.firstname = firstname;
  if (surname !== undefined) fieldsToUpdate.surname = surname;
  if (bio !== undefined) fieldsToUpdate.bio = bio;
  if (pronouns !== undefined) fieldsToUpdate.pronouns = pronouns;
  if (profilePicture !== undefined) fieldsToUpdate.profilePicture = profilePicture;

  if (Object.keys(fieldsToUpdate).length > 0) {
    await collection.updateOne({ _id: userMatch._id }, { $set: fieldsToUpdate });
  }

  const updatedUser = await collection.findOne({ _id: userMatch._id });
  const { password: _, ...userWithoutPassword } = updatedUser;

  return {
    success: true,
    status: 200,
    message: Object.keys(fieldsToUpdate).length > 0 ? "Profile updated successfully!" : "No changes to save.",
    user: userWithoutPassword
  };
}

// Delete Profile (self-deletion, or deletion by an admin)
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

  const isSelfDelete = requester.username === targetUser.username;
  const isAdmin = requester.admin === true;

  if (!isSelfDelete && !isAdmin) {
    return {
      success: false,
      status: 403,
      message: "Access denied. You can only delete your own profile unless you are an administrator."
    };
  }

  await collection.deleteOne({ _id: targetUser._id });

  // Clean up everything that pointed at this user
  await db.collection("Posts").deleteMany({ userID: targetUser._id });
  await collection.updateMany(
    { friendsListID: targetUser._id },
    { $pull: { friendsListID: targetUser._id } }
  );
  await db.collection("Friends").deleteMany({
    $or: [{ senderID: targetUser._id }, { receiverID: targetUser._id }]
  });

  return {
    success: true,
    status: 200,
    message: isSelfDelete
      ? `Your profile '${cleanTarget}' has been successfully deleted.`
      : `Profile for user '${cleanTarget}' has been successfully deleted by admin '${requester.username}'.`
  };
}

// Search users by username / first name / surname (no passwords or emails returned)
async function searchUsers(query) {
  const q = String(query || "").trim();
  if (!q) return { success: true, status: 200, users: [] };

  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "i");

  const users = await getDB()
    .collection("Users")
    .find({ $or: [{ username: regex }, { firstname: regex }, { surname: regex }] })
    .project({ password: 0, email: 0 })
    .limit(20)
    .toArray();

  return { success: true, status: 200, users };
}

module.exports = {
  loginUser,
  signUp,
  logoutUser,
  getProfile,
  updateProfile,
  deleteProfile,
  searchUsers
};