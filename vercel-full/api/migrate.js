// Database migration script
import { sql } from './db.js';

// Create users table if it doesn't exist
async function createUsersTable() {
  try {
    console.log('Creating users table if it doesn\'t exist...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    console.log('Users table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating users table:', error);
    return { success: false, error: error.message };
  }
}

// Run migrations
export async function runMigrations() {
  try {
    const usersResult = await createUsersTable();
    
    return {
      success: usersResult.success,
      message: 'Migrations completed successfully',
      details: {
        users: usersResult
      }
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: 'Migrations failed',
      error: error.message
    };
  }
}

// Export for direct execution
export default async function migrate() {
  const result = await runMigrations();
  console.log('Migration result:', result);
  return result;
}
