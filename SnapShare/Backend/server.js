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

        const DUMMY_USERS = [
        {
            id: 1 ,
            username: "tadiwanashe",
            firstname: "Tadiwanashe",
            surname: "Chigeza",
            email: "tadiwanashe@example.com",
            password: "password123"
        },
        {
            id: 2 ,
            username: "john_doe",
            firstname: "John",
            surname: "Doe",
            email: "john@example.com",
            password: "password123"
        },
        {
            id: 3 ,
            username: "sarah_c",
            firstname: "Sarah",
            surname: "Connor",
            email: "sarah@example.com",
            password: "password123"
        },
        {
            id: 4 ,
            username: "alex_smith",
            firstname: "Alex",
            surname: "Smith",
            email: "alex@example.com",
            password: "password123"
        }
        ];

// Stubbed Login Endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
    //validate request
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  // Search for username (case-insensitive)
  const userMatch = DUMMY_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

  if (!userMatch) {
        return res.status(401).json({ error: "Username does not exist." });
  }

  if (userMatch.password !== password) {
        return res.status(401).json({ error: "Incorrect password entered." });
  }

  //response returning dummy user data
  return res.status(200).json({
    message: "Login-in successful!",
    user: {
      username: userMatch.username,
      firstname: userMatch.firstname,
      surname: userMatch.surname,
      email: userMatch.email
    }
  });
});



// Stubbed Sign-Up Endpoint

app.post("/api/signup", (req, res) => {
  const { firstname, surname, username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required sign-up fields." });
  }

  //Check if username already exists
  const usernameExists = DUMMY_USERS.some(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (usernameExists) {
    return res.status(400).json({ error: "Username is already taken." });
  }

  // Check if email already exists
  const emailExists = DUMMY_USERS.some(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (emailExists) {
    return res.status(400).json({ error: "Email address is already in use." });
  }

  //Return created user structure without mutating DUMMY_USERS
  return res.status(201).json({
    message: "Sign-up successful!",
    user: {
      username: username,
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