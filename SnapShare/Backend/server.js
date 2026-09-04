// Server-side = Runs in Node.js and handles Express + Socket.IO

const http = require("http"); 
const express = require("express"); 
const { Server } = require("socket.io"); 

const app = express(); 
const server = http.createServer(app); 
const io = new Server(server); 

// Middleware
app.use(express.json()); // Parses JSON payloads from POST requests
app.use(express.static("public")); 

// Stubbed Login Endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Stubbed response returning dummy user data
  return res.status(200).json({
    message: "Sign-in successful!",
    user: {
      username: username,
      firstname: "Tadiwanashe",
      surname: "Chigeza",
      email: `${username}@example.com`
    }
  });
});

// Stubbed Sign-Up Endpoint
app.post("/api/signup", (req, res) => {
  const { firstname, surname, usernameID, email, password } = req.body;

  if (!usernameID || !email || !password) {
    return res.status(400).json({ error: "Missing required sign-up fields." });
  }

  // Stubbed response confirming account creation
  return res.status(201).json({
    message: "Sign-up successful!",
    user: {
      username: usernameID,
      firstname: firstname || "User",
      surname: surname || "Name",
      email: email
    }
  });
});

function updateUserCount() {
    const userCount = io.sockets.sockets.size;
    io.emit("userCount", userCount);
}

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    updateUserCount();

    socket.emit("systemMessage", {
        text: "A user connected."
    });
        
    socket.on("hello", (data) => {
        // Validate username
        if (!data.username || data.username.trim() === "") {
            socket.emit("messageError", "Please enter a display name.");
            return;
        }

        // Validate message
        if (!data.text || data.text.trim() === "") {
            socket.emit("messageError", "Please enter a message.");
            return;
        }

        const message = {
            username: data.username,
            text: data.text,
            timestamp: new Date().toISOString()
        };
          
        io.emit("hello", message); // Broadcast hello message 
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        updateUserCount();
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Messenger server running on http://localhost:${PORT}`);
});