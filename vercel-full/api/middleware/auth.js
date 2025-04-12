// Authentication middleware for serverless environment
import jwt from 'jsonwebtoken';

// Secret key for JWT
const JWT_SECRET = process.env.SESSION_SECRET || 'default-secret-key-change-in-production';

// Generate JWT token
export function generateToken(user) {
  // Remove sensitive information
  const userInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
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
