
// Sever.js  for the  API 

const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const { connectDB } = require("./database");

// Import API Routes
const profileRoutes = require("./api/PorfileRoutes");
const friendsRoutes = require("./api/FriendsRoutes");
const postRoutes = require("./api/PostRoutes");
const albumRoutes = require("./api/AlbumRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Mount API routes
app.use("/api", profileRoutes);
app.use("/api", friendsRoutes);
app.use("/api", postRoutes);
app.use("/api", albumRoutes);

// Socket.IO real-time active user tracking
function updateUserCount() {
  const userCount = io.sockets.sockets.size;
  io.emit("userCount", userCount);
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  updateUserCount();

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    updateUserCount();
  });
});

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });