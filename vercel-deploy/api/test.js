// Simple test API endpoint
import express from 'express';
import { json } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(json());

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Test login endpoint
app.post('/api/test/login', (req, res) => {
  console.log('Test login endpoint called with body:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  // Always succeed for testing
  res.json({
    success: true,
    message: 'Login successful (test)',
    user: {
      id: 1,
      username,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      type: 'candidate'
    },
    token: 'test-token-' + Date.now()
  });
});

// Export the Express API
export default app;
