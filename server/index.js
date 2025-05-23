const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const app = express();

// Remove any existing CSP headers
app.use((req, res, next) => {
  // Remove any existing CSP headers
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  next();
});

// Set new CSP headers
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Simplified CSP for production
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https://*.vercel.app; connect-src 'self' https://*.vercel.app; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; frame-src 'self' https://www.youtube.com; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Update CORS configuration
const corsOptions = {
  origin: true, // Allow all origins temporarily for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: 'lax'
  }
}));

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const validCredentials = {
  username: 'admin',
  password: 'password'
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === validCredentials.username && password === validCredentials.password) {
    req.session.user = { username };
    return res.status(200).json({ message: 'Login successful' });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

app.all('/api/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.get('/api/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ 
    message: 'Protected route accessed', 
    user: req.session.user 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 