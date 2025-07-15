const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Simple login middleware & route
app.use((req, res, next) => {
  if (!req.cookies.name || req.cookies.pass !== 'uss') {
    // Only allow POST /login
    if (req.method === 'POST' && req.path === '/login') {
      return next();
    }
    // Otherwise serve login page
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  // User is logged in
  req.user = { name: req.cookies.name };
  next();
});

app.post('/login', (req, res) => {
  const { name, pass } = req.body;
  if (pass === 'uss' && name && name.trim().length > 0) {
    // Set cookies 7 days expiry
    res.cookie('name', name.trim(), { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('pass', pass, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ success: true });
  } else {
    return res.status(403).json({ success: false });
  }
});

// Serve the main chat UI page after login (placeholder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
