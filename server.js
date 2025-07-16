const express = require('express');
const http = require('http');
const path = require('path');
const mime = require('mime-types');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files (html, css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store
let users = {};           // { socketId: { name, pic, active, lastSeen } }
let usernames = {};       // { name: socketId }
let messages = {
  group: []               // [{ sender, content, type, timestamp }]
};
let privateChats = {};    // { name1_name2: [messages] }

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('login', ({ name, pic }) => {
    // Check duplicate username
    if (Object.values(users).find(u => u.name === name)) {
      socket.emit('name-taken');
      return;
    }

    users[socket.id] = {
      name,
      pic,
      active: true,
      lastSeen: new Date()
    };

    usernames[name] = socket.id;

    // Join group room
    socket.join('group');

    // Send chat history
    socket.emit('chat-history', messages.group);

    // Update user list to all
    io.emit('user-list', getAllUsers());

    console.log(`${name} logged in`);
  });

  socket.on('send-message', (msg) => {
    const user = users[socket.id];
    if (!user) return;

    const data = {
      sender: user.name,
      content: msg.content,
      type: msg.type || 'text',
      timestamp: new Date().toLocaleTimeString()
    };

    if (msg.to === 'group') {
      messages.group.push(data);
      io.to('group').emit('new-message', data);
    } else {
      const targetId = usernames[msg.to];
      if (!targetId) return;

      const key = createPrivateKey(user.name, msg.to);
      if (!privateChats[key]) privateChats[key] = [];
      privateChats[key].push(data);

      io.to(socket.id).emit('new-message', data);
      io.to(targetId).emit('new-message', data);
    }
  });

  socket.on('typing', (to) => {
    const user = users[socket.id];
    if (!user) return;

    if (to === 'group') {
      socket.to('group').emit('typing', user.name);
    } else {
      const targetId = usernames[to];
      if (targetId) io.to(targetId).emit('typing', user.name);
    }
  });

  socket.on('get-private-chat', (withUser) => {
    const me = users[socket.id];
    const key = createPrivateKey(me.name, withUser);
    const chat = privateChats[key] || [];
    socket.emit('private-history', { withUser, chat });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      users[socket.id].active = false;
      users[socket.id].lastSeen = new Date();
      io.emit('user-list', getAllUsers());
      console.log(user.name, 'disconnected');
    }
  });
});

// Helper: get all user data
function getAllUsers() {
  return Object.values(users).map(u => ({
    name: u.name,
    pic: u.pic,
    active: u.active
  }));
}

function createPrivateKey(name1, name2) {
  return [name1, name2].sort().join('_');
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
