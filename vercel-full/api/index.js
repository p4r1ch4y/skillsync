// Main API handler for Vercel serverless environment
import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { checkDatabaseConnection } from './db.js';

// Create Express server
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic API route
app.get('/api', (req, res) => {
  res.json({
    message: 'TalentSync API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();

    res.json({
      status: 'ok',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    api: {
      name: 'TalentSync API',
      version: '1.0.0',
      endpoints: [
        { path: '/api', method: 'GET', description: 'API information' },
        { path: '/api/health', method: 'GET', description: 'Health check' },
        { path: '/api/auth/register', method: 'POST', description: 'Register a new user' },
        { path: '/api/auth/login', method: 'POST', description: 'Login a user' },
        { path: '/api/auth/me', method: 'GET', description: 'Get current user (requires authentication)' },
        { path: '/api/profile', method: 'GET', description: 'Get user profile (requires authentication)' },
        { path: '/api/dashboard', method: 'GET', description: 'Get dashboard data (requires authentication)' }
      ]
    }
  });
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Export the Express API
export default app;
