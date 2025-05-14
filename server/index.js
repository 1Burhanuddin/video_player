const express = require('express');
const session = require('express-session');
const path = require('path');
const streamRouter = require('./routes/stream');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Hardcoded credentials for login
const validCredentials = {
  username: 'admin',
  password: 'password'
};

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === validCredentials.username && password === validCredentials.password) {
    req.session.user = { username };
    return res.status(200).json({ message: 'Login successful' });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Logout route
app.get('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Protected route example
app.get('/api/protected', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ message: 'Protected route accessed', user: req.session.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Use the stream router
app.use('/api', streamRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 