const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;
let users = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let userName = '';

  socket.on('join', (name) => {
    userName = name;
    users[socket.id] = name;
    io.emit('userList', Object.values(users));
  });

  socket.on('message', (data) => {
    if (data.to === 'group') {
      io.emit('message', data);
    } else {
      const targetSocketId = Object.keys(users).find(
        key => users[key] === data.to
      );
      if (targetSocketId) {
        io.to(targetSocketId).emit('message', data);
        socket.emit('message', data); // for sender
      }
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });
});

http.listen(PORT, () => {
  console.log(`🐦 Pakhiiiiiiiiiiiii Server running on http://localhost:${PORT}`);
});
