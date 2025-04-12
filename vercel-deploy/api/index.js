// Serverless API handler for Vercel
import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { checkDatabaseConnection } from './db.js';
import { storage } from './storage.js';
import { authenticate, login, register, getCurrentUser } from './auth.js';
import { computeMatchScore } from './skillMatching.js';

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

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '****' });

    // Create schema for user registration
    const registerSchema = z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string(),
      lastName: z.string(),
      type: z.enum(['candidate', 'company']).default('candidate')
    });

    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if username or email already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Register user
    const result = await register(validatedData);

    if (!result.success) {
      console.error('Registration failed:', result);
      return res.status(400).json({
        message: result.message,
        error: result.error
      });
    }

    // Create empty user skills for this user if they're a candidate
    if (result.user.type === "candidate") {
      try {
        // Get all skills
        const skills = await storage.getAllSkills();

        // For each skill, create an unverified user skill with score 0
        for (const skill of skills) {
          await storage.createUserSkill({
            userId: result.user.id,
            skillId: skill.id,
            score: 0,
            isVerified: false
          });
        }
      } catch (skillError) {
        console.error('Error creating user skills:', skillError);
        // Continue anyway, we don't want to fail registration if skill creation fails
      }
    }

    console.log('User registered successfully:', validatedData.username);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', { ...req.body, password: '****' });

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Login validation failed: missing required fields');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Attempting to login user:', username);

    const result = await login(username, password);

    if (!result.success) {
      console.error('Login failed:', result);
      return res.status(401).json({
        message: result.message,
        error: result.error
      });
    }

    console.log('User logged in successfully:', username);

    // Get user skills if the user is a candidate
    if (result.user.type === 'candidate') {
      try {
        const userSkills = await storage.getUserSkillsByUserId(result.user.id);
        result.user.skills = userSkills;
      } catch (skillError) {
        console.error('Error fetching user skills:', skillError);
        // Continue anyway, we don't want to fail login if skill fetching fails
      }
    }

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await getCurrentUser(req.user.id);

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

// User routes
app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user is trying to access their own profile
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to user data' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user is trying to update their own profile
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    // Create schema for profile update (subset of user fields)
    const updateProfileSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      bio: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      education: z.string().optional().nullable(),
      experience: z.string().optional().nullable(),
      onboardingCompleted: z.boolean().optional(),
      profileCompleted: z.boolean().optional()
    });

    const validatedData = updateProfileSchema.parse(req.body);

    // Update user
    const updatedUser = await storage.updateUser(userId, validatedData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: error.errors
      });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Skill routes
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await storage.getAllSkills();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

// User skill routes
app.get('/api/user-skills', authenticate, async (req, res) => {
  try {
    const userSkills = await storage.getUserSkillsByUserId(req.user.id);

    // Get the skill details for each user skill
    const skillsWithDetails = await Promise.all(
      userSkills.map(async (userSkill) => {
        const skill = await storage.getSkill(userSkill.skillId);
        return {
          ...userSkill,
          skill
        };
      })
    );

    res.json(skillsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user skills' });
  }
});

// Opportunity routes
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await storage.getAllOpportunities();

    // Get company details for each opportunity
    const opportunitiesWithCompanies = await Promise.all(
      opportunities.map(async (opportunity) => {
        const company = await storage.getCompany(opportunity.companyId);

        // If a user is logged in, calculate their match score for this opportunity
        let matchScore = null;
        if (req.user) {
          const userType = req.user.type;

          if (userType === 'candidate') {
            const userSkills = await storage.getUserSkillsByUserId(req.user.id);
            matchScore = computeMatchScore(userSkills, opportunity.requiredSkills);
          }
        }

        return {
          ...opportunity,
          company,
          matchScore
        };
      })
    );

    // Sort by match score if available
    opportunitiesWithCompanies.sort((a, b) => {
      if (a.matchScore !== null && b.matchScore !== null) {
        return b.matchScore - a.matchScore;
      }
      return 0;
    });

    res.json(opportunitiesWithCompanies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching opportunities' });
  }
});

// Analytics route
app.get('/api/analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const analyticsData = await storage.getAnalyticsData(userId);
    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// Recent activity route
app.get('/api/recent-activity', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const recentActivity = await storage.getRecentActivity(userId);
    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
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
        { path: '/api/users/:id', method: 'GET', description: 'Get user profile (requires authentication)' },
        { path: '/api/users/:id', method: 'PUT', description: 'Update user profile (requires authentication)' },
        { path: '/api/skills', method: 'GET', description: 'Get all skills' },
        { path: '/api/user-skills', method: 'GET', description: 'Get user skills (requires authentication)' },
        { path: '/api/opportunities', method: 'GET', description: 'Get all opportunities' }
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
