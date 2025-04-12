// Protected API routes that require authentication
import express from 'express';
import { json } from 'express';
import { authenticate } from './middleware/auth.js';

const app = express();
app.use(json());

// Use authentication middleware for all routes
app.use(authenticate);

// Get user profile
app.get('/api/profile', (req, res) => {
  // The user object is attached to the request by the authenticate middleware
  const { id, username, email, role } = req.user;
  
  res.json({
    profile: {
      id,
      username,
      email,
      role
    }
  });
});

// Update user profile
app.put('/api/profile', (req, res) => {
  // In a real implementation, this would update the user's profile in the database
  res.json({
    message: 'Profile updated successfully',
    profile: {
      ...req.user,
      ...req.body
    }
  });
});

// Get user dashboard data
app.get('/api/dashboard', (req, res) => {
  // In a real implementation, this would fetch dashboard data from the database
  res.json({
    dashboard: {
      stats: {
        projects: 5,
        tasks: 23,
        completed: 15
      },
      recentActivity: [
        { id: 1, type: 'task', action: 'created', date: new Date().toISOString() },
        { id: 2, type: 'project', action: 'updated', date: new Date().toISOString() }
      ]
    }
  });
});

// Export the Express API
export default app;
