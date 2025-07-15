const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {}; // socket.id => { name, number }

io.on('connection', socket => {
  socket.on('login', user => {
    users[socket.id] = user;
    io.emit('active-users', Object.values(users));
  });

  socket.on('chat message', ({ to, message }) => {
    if (to === 'group') {
      io.emit('group message', {
        user: users[socket.id],
        message,
      });
    } else {
      for (let sid in users) {
        if (users[sid].number === to || sid === socket.id) {
          io.to(sid).emit('private message', {
            from: users[socket.id],
            to,
            message,
          });
        }
      }
    }
  });

  socket.on('image', ({ to, image }) => {
    if (to === 'group') {
      io.emit('group image', {
        user: users[socket.id],
        image,
      });
    } else {
      for (let sid in users) {
        if (users[sid].number === to || sid === socket.id) {
          io.to(sid).emit('private image', {
            from: users[socket.id],
            image,
          });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('active-users', Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
