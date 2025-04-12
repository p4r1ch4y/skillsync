// Setup API for database migrations
import express from 'express';
import { json } from 'express';
import { runMigrations } from './migrate.js';
import { checkDatabaseConnection } from './db.js';

const app = express();
app.use(json());

// Run database migrations
app.get('/api/setup/migrate', async (req, res) => {
  try {
    // Check database connection first
    const dbStatus = await checkDatabaseConnection();
    
    if (!dbStatus.connected) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: dbStatus.error
      });
    }
    
    // Run migrations
    const result = await runMigrations();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
  }
});

// Database status
app.get('/api/setup/status', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    
    res.json({
      success: true,
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error.message
    });
  }
});

// Export the Express API
export default app;
