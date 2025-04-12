// Authentication service
import bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { db } from '../db.js';
import { users } from '../schema.js';
import { generateToken } from '../middleware/auth.js';

// Register a new user
export async function registerUser(userData) {
  try {
    console.log('Checking if user exists:', userData.username);

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(
        or(
          eq(users.username, userData.username),
          eq(users.email, userData.email)
        )
      )
      .limit(1);

    console.log('Existing user check result:', existingUser.length > 0 ? 'User exists' : 'User does not exist');

    if (existingUser.length > 0) {
      return { success: false, message: 'Username or email already exists' };
    }

    console.log('Hashing password...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    console.log('Password hashed successfully');
    console.log('Creating user in database...');

    // Create user
    const newUser = await db.insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user'
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role
      });

    console.log('User created successfully:', newUser[0].username);
    console.log('Generating token...');

    // Generate token
    const token = generateToken(newUser[0]);

    console.log('Token generated successfully');

    return {
      success: true,
      user: newUser[0],
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    // Provide more detailed error message
    let errorMessage = 'Registration failed';

    if (error.code === '23505') {
      errorMessage = 'Username or email already exists';
    } else if (error.message) {
      errorMessage = `Registration failed: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code || 'UNKNOWN',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    };
  }
}

// Login user
export async function loginUser(username, password) {
  try {
    console.log('Finding user in database:', username);

    // Find user
    const user = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    console.log('User search result:', user.length === 0 ? 'User not found' : 'User found');

    if (user.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('Checking password...');

    // Check password
    const isMatch = await bcrypt.compare(password, user[0].password);

    console.log('Password check result:', isMatch ? 'Password matches' : 'Password does not match');

    if (!isMatch) {
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('Generating token...');

    // Generate token
    const token = generateToken(user[0]);

    console.log('Token generated successfully');

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user[0];

    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    // Provide more detailed error message
    let errorMessage = 'Login failed';

    if (error.message) {
      errorMessage = `Login failed: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code || 'UNKNOWN',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    };
  }
}

// Get user by ID
export async function getUserById(id) {
  try {
    const user = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

    if (user.length === 0) {
      return { success: false, message: 'User not found' };
    }

    return {
      success: true,
      user: user[0]
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, message: 'Failed to get user', error: error.message };
  }
}
