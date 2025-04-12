// Authentication API for Vercel serverless environment
import express from 'express';
import { json } from 'express';
import { authenticate } from './middleware/auth.js';
import { registerUser, loginUser, getUserById } from './services/auth-service.js';

const app = express();
app.use(json());

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await getUserById(req.user.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.json({
      user: result.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '****' });

    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      console.log('Registration validation failed: missing required fields');
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    console.log('Attempting to register user:', username);

    const result = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName
    });

    if (!result.success) {
      console.error('Registration failed:', result);
      return res.status(400).json({
        message: result.message,
        error: result.error,
        code: result.code
      });
    }

    console.log('User registered successfully:', username);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', { ...req.body, password: '****' });

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Login validation failed: missing required fields');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Attempting to login user:', username);

    const result = await loginUser(username, password);

    if (!result.success) {
      console.error('Login failed:', result);
      return res.status(401).json({
        message: result.message,
        error: result.error,
        code: result.code
      });
    }

    console.log('User logged in successfully:', username);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  // With JWT, we don't need to do anything server-side
  // The client should remove the token from storage
  res.json({ message: 'Logged out successfully' });
});

// Export the Express API
export default app;
