const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// serve public folder
app.use(express.static(path.join(__dirname, 'public')));

let users = {}; // socket.id -> user info

io.on('connection', socket => {
  socket.on('login', user => {
    users[socket.id] = user;
    socket.emit('loggedin', user);
  });

  socket.on('chat message', msg => {
    io.emit('chat message', { user: users[socket.id], text: msg });
  });

  socket.on('chat image', img => {
    io.emit('chat image', { user: users[socket.id], image: img });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
