const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const users = {}; // socketId => userObj
const nameToSocket = {}; // name => socketId
const messages = {
  group: [],
  private: {}, // roomId => [msg]
};

const adminPassword = "admin123"; // change if needed

io.on("connection", (socket) => {
  const ip = socket.handshake.address;

  socket.on("login", (user, callback) => {
    if (Object.values(users).some((u) => u.name === user.name)) {
      return callback({ success: false });
    }

    users[socket.id] = { ...user, ip };
    nameToSocket[user.name] = socket.id;
    io.emit("user-list", Object.values(users));
    callback({ success: true });
  });

  socket.on("get-users", () => {
    socket.emit("user-list", Object.values(users));
  });

  socket.on("send-group-message", (msg) => {
    messages.group.push(msg);
    io.emit("group-message", msg);
  });

  socket.on("join-private", (roomId) => {
    socket.join(roomId);
    if (!messages.private[roomId]) messages.private[roomId] = [];
    socket.emit("chat-history", messages.private[roomId]);
  });

  socket.on("send-private-message", (msg) => {
    const roomId = msg.room;
    if (!messages.private[roomId]) messages.private[roomId] = [];
    messages.private[roomId].push(msg);
    io.to(roomId).emit("private-message", msg);
  });

  socket.on("typing-group", (name) => {
    socket.broadcast.emit("group-typing", name);
  });

  socket.on("typing-private", (data) => {
    socket.to(data.room).emit("private-typing", data.name);
  });

  socket.on("admin-clear", (pass, callback) => {
    if (pass === adminPassword) {
      messages.group = [];
      for (let key in messages.private) {
        messages.private[key] = [];
      }
      callback("✅ All messages cleared by admin.");
    } else {
      callback("❌ Incorrect admin password.");
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      delete nameToSocket[user.name];
    }
    delete users[socket.id];
    io.emit("user-list", Object.values(users));
  });
});

// fallback for frontend routing (if SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
