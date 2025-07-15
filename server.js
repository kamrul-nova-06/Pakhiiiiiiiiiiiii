// server.js const express = require('express'); const http = require('http'); const { Server } = require('socket.io'); const bodyParser = require('body-parser'); const cookieParser = require('cookie-parser'); const path = require('path');

const app = express(); const server = http.createServer(app); const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'))); app.use(bodyParser.json()); app.use(cookieParser());

let users = []; // { name, ip, active } let messages = []; // { from, to, text, image, time }

// Middleware to handle simple login logic with cookies app.use((req, res, next) => { if (!req.cookies.name || req.cookies.pass !== 'uss') { if (req.method === 'POST' && req.url === '/login') { const { name, pass } = req.body; if (pass === 'uss') { res.cookie('name', name, { maxAge: 604800000 }); // 7 days res.cookie('pass', pass, { maxAge: 604800000 }); return res.json({ success: true }); } else { return res.status(403).json({ success: false }); } } else { return res.sendFile(path.join(__dirname, 'public', 'login.html')); } } else { req.user = { name: req.cookies.name }; next(); } });

app.get('/user-info', (req, res) => { res.json({ name: req.cookies.name }); });

io.on('connection', (socket) => { const ip = socket.handshake.address; let username = '';

socket.on('register', (name) => { username = name; const existing = users.find(u => u.name === name); if (existing) { existing.active = true; } else { users.push({ name, ip, active: true }); } io.emit('user list', users); });

socket.on('chat message', (msg) => { msg.time = Date.now(); messages.push(msg); io.emit('chat message', msg); });

socket.on('load chat', ({ to }) => { const filtered = messages.filter(m => m.to === to || m.from === to || m.to === 'group'); socket.emit('chat history', filtered); });

socket.on('typing', ({ from, to }) => { socket.broadcast.emit('typing', from); });

socket.on('stop typing', ({ from, to }) => { socket.broadcast.emit('stop typing'); });

socket.on('disconnect', () => { const user = users.find(u => u.name === username); if (user) user.active = false; io.emit('user list', users); }); });

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

