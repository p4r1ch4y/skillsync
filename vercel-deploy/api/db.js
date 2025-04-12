// Database connection for serverless environment
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
}

// Log the database URL (with password masked)
const dbUrlForLogging = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace(/:\\/\\/([^:]+):([^@]+)@/, '://$1:****@')
  : 'not set';
console.log(`Connecting to database: ${dbUrlForLogging}`);

// Create a SQL client with Neon
const sql = neon(process.env.DATABASE_URL || '');

// Create a Drizzle client
export const db = drizzle(sql);

// Export the SQL client for raw queries
export { sql };

// Health check function
export async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    // Try a simple query to check connection
    const result = await sql`SELECT 1 as connected`;
    console.log('Database connection successful:', result);
    return { 
      connected: result[0]?.connected === 1, 
      timestamp: new Date().toISOString(),
      database: dbUrlForLogging
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      connected: false, 
      error: error.message, 
      timestamp: new Date().toISOString(),
      database: dbUrlForLogging
    };
  }
}
