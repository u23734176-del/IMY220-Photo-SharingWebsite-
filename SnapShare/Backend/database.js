// Database to etch from MonogoDatabase
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

let client;
let database;

dotenv.config(); // get the env varablile

async function connectDB() {
    const uri = process.env.MONGO_URI; // From .env file
    
    client = new MongoClient(uri);
    await client.connect(); 
    database = client.db("SnapShare");
    if(!database){
        console.log("Failed to connect to Database");
    }
    console.log("Connected to databse");
}

function getDB() {
    return db;
}

export {connectDB , getDB };



