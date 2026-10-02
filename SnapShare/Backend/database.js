// Database to etch from MonogoDatabase
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

let client;
let database;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db("SnapShare");
  
  if (!database) {
    console.log("Failed to connect to Database");
  } else {
    console.log("Connected successfully to MongoDB Atlas: SnapShare");
  }
}

function getDB() {
  if (!database) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return database;
}

module.exports = { connectDB, getDB };
