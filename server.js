// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const PORT = process.env.PORT || 3000;

let users = {}; // username -> { name, pic, active }
let sockets = {}; // socketId -> username
let messages = { group: [] }; // { group: [...], private: {A_B: [...]} }
let groups = []; // { name, password, members: [usernames] }

const defaultPics = ["/default1.png", "/default2.png"];

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/private-chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "private-chat.html"));
});

app.get("/group-chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "group-chat.html"));
});

app.get("/group-create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "group-create.html"));
});

// API endpoints
app.post("/login", (req, res) => {
  const { name, password, pic } = req.body;
  if (password !== "uss") return res.status(403).send("Invalid password");

  let finalName = name;
  let count = 1;
  while (users[finalName]) {
    finalName = name + count;
    count++;
  }
  const assignedPic = pic || defaultPics[Math.floor(Math.random() * 2)];

  users[finalName] = { name: finalName, pic: assignedPic, active: true };
  return res.json({ name: finalName, pic: assignedPic });
});

app.get("/users", (req, res) => {
  res.json(Object.values(users));
});

app.get("/messages/:room", (req, res) => {
  const room = req.params.room;
  if (messages[room]) {
    res.json(messages[room]);
  } else {
    res.json([]);
  }
});

app.post("/group", (req, res) => {
  const { name, password, members } = req.body;
  groups.push({ name, password, members });
  messages[name] = [];
  res.sendStatus(200);
});

app.get("/groups", (req, res) => {
  res.json(groups);
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join", (username) => {
    sockets[socket.id] = username;
    if (users[username]) users[username].active = true;
    io.emit("user-list", Object.values(users));
  });

  socket.on("typing", ({ from, to }) => {
    socket.broadcast.emit("typing", { from, to });
  });

  socket.on("send-message", ({ to, from, text, image, file }) => {
    const msg = {
      from,
      text,
      time: new Date().toLocaleTimeString(),
      image,
      file
    };
    if (to === "group") {
      messages.group.push(msg);
      io.emit("group-message", msg);
    } else {
      const key = [from, to].sort().join("_");
      if (!messages[key]) messages[key] = [];
      messages[key].push(msg);
      io.emit("private-message", { to, from, msg });
    }
  });

  socket.on("disconnect", () => {
    const user = sockets[socket.id];
    if (users[user]) users[user].active = false;
    io.emit("user-list", Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
