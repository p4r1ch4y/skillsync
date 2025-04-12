// Authentication middleware and utilities
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserByUsername, createUser, getUser } from './storage.js';

// Secret key for JWT
const JWT_SECRET = process.env.SESSION_SECRET || 'default-secret-key-change-in-production';

// Generate JWT token
export function generateToken(user) {
  // Remove sensitive information
  const userInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    type: user.type
  };

  // Sign the token with a 24-hour expiration
  return jwt.sign(userInfo, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticate(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Verify token
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Attach user to request
  req.user = user;
  next();
}

// Login function
export async function login(username, password) {
  try {
    console.log('Finding user in database:', username);

    // Find user
    const user = await getUserByUsername(username);

    console.log('User search result:', user ? 'User found' : 'User not found');

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('Checking password...');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log('Password check result:', isMatch ? 'Password matches' : 'Password does not match');

    if (!isMatch) {
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('Generating token...');

    // Generate token
    const token = generateToken(user);

    console.log('Token generated successfully');

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: `Login failed: ${error.message}`,
      error: error.message
    };
  }
}

// Register function
export async function register(userData) {
  try {
    console.log('Hashing password...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    console.log('Password hashed successfully');
    console.log('Creating user in database...');

    // Create user
    const newUser = await createUser({
      ...userData,
      password: hashedPassword
    });

    console.log('User created successfully:', newUser.username);
    console.log('Generating token...');

    // Generate token
    const token = generateToken(newUser);

    console.log('Token generated successfully');

    // Return user info without password
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
      error: error.message
    };
  }
}

// Get current user
export async function getCurrentUser(userId) {
  try {
    const user = await getUser(userId);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      message: `Failed to get user: ${error.message}`,
      error: error.message
    };
  }
}
