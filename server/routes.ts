import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcrypt";
import { 
  insertUserSchema, insertUserSkillSchema, insertUserChallengeSchema,
  insertOpportunitySchema, insertApplicationSchema, insertMessageSchema,
  insertCompanySchema
} from "@shared/schema";
import { computeMatchScore } from "../shared/skillMatching";

// User session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "skillsync_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Helper to check user type
  const getUserType = async (userId: number) => {
    const user = await storage.getUser(userId);
    return user?.type || "candidate";
  };

  // API Routes
  // prefix all routes with /api
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Auth routes
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });

  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  apiRouter.get("/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // User routes
  apiRouter.get("/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is trying to access their own profile or admin access
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to user data" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.put("/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is trying to update their own profile
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to update this user" });
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
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Skill routes
  apiRouter.get("/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Error fetching skills" });
    }
  });

  // User skill routes
  apiRouter.get("/user-skills", requireAuth, async (req, res) => {
    try {
      const userSkills = await storage.getUserSkillsByUserId(req.session.userId!);
      
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
      res.status(500).json({ message: "Error fetching user skills" });
    }
  });

  apiRouter.post("/user-skills", requireAuth, async (req, res) => {
    try {
      const userSkillData = insertUserSkillSchema.parse(req.body);
      
      // Make sure the user is creating a skill for themselves
      if (userSkillData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if the skill exists
      const skill = await storage.getSkill(userSkillData.skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if the user already has this skill
      const userSkills = await storage.getUserSkillsByUserId(req.session.userId);
      const existingSkill = userSkills.find(us => us.skillId === userSkillData.skillId);
      
      if (existingSkill) {
        return res.status(400).json({ message: "User already has this skill" });
      }
      
      const userSkill = await storage.createUserSkill(userSkillData);
      res.status(201).json(userSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user skill" });
    }
  });

  // Challenge routes
  apiRouter.get("/challenges", async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      
      // Get the skill details for each challenge
      const challengesWithSkills = await Promise.all(
        challenges.map(async (challenge) => {
          const skill = await storage.getSkill(challenge.skillId);
          return {
            ...challenge,
            skill
          };
        })
      );
      
      res.json(challengesWithSkills);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });

  apiRouter.get("/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(parseInt(req.params.id));
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Get the skill details for the challenge
      const skill = await storage.getSkill(challenge.skillId);
      
      res.json({
        ...challenge,
        skill
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenge" });
    }
  });

  // User challenge routes
  apiRouter.post("/user-challenges", requireAuth, async (req, res) => {
    try {
      const userChallengeData = insertUserChallengeSchema.parse(req.body);
      
      // Make sure the user is starting a challenge for themselves
      if (userChallengeData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if the challenge exists
      const challenge = await storage.getChallenge(userChallengeData.challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      const userChallenge = await storage.createUserChallenge(userChallengeData);
      res.status(201).json(userChallenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user challenge" });
    }
  });

  apiRouter.put("/user-challenges/:id/submit", requireAuth, async (req, res) => {
    try {
      const userChallengeId = parseInt(req.params.id);
      const { submission } = req.body;
      
      if (!submission) {
        return res.status(400).json({ message: "Submission is required" });
      }
      
      // Get the user challenge
      const userChallenge = await storage.getUserChallenge(userChallengeId);
      
      if (!userChallenge) {
        return res.status(404).json({ message: "User challenge not found" });
      }
      
      // Make sure the user is submitting their own challenge
      if (userChallenge.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get the challenge
      const challenge = await storage.getChallenge(userChallenge.challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Calculate score based on some simple algorithms (in a real app, this would be more complex)
      // For this demo, we'll use a random score between 50 and 100
      const score = Math.floor(Math.random() * 51) + 50;
      
      // Update the user challenge
      const now = new Date();
      const updatedUserChallenge = await storage.updateUserChallenge(userChallengeId, {
        submission,
        score,
        status: "completed",
        completedAt: now
      });
      
      // Check if this challenge is for a skill the user has
      // If so, update the skill score and verify it
      const userSkills = await storage.getUserSkillsByUserId(req.session.userId);
      const userSkill = userSkills.find(us => us.skillId === challenge.skillId);
      
      if (userSkill) {
        await storage.verifyUserSkill(userSkill.id, score);
      }
      
      res.json(updatedUserChallenge);
    } catch (error) {
      res.status(500).json({ message: "Error submitting user challenge" });
    }
  });

  apiRouter.get("/user-challenges", requireAuth, async (req, res) => {
    try {
      const userChallenges = await storage.getUserChallengesByUserId(req.session.userId!);
      
      // Get challenge details for each user challenge
      const challengesWithDetails = await Promise.all(
        userChallenges.map(async (userChallenge) => {
          const challenge = await storage.getChallenge(userChallenge.challengeId);
          const skill = challenge ? await storage.getSkill(challenge.skillId) : null;
          
          return {
            ...userChallenge,
            challenge,
            skill
          };
        })
      );
      
      res.json(challengesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user challenges" });
    }
  });

  // Company routes
  apiRouter.post("/companies", requireAuth, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      
      // Make sure the user is creating a company for themselves
      if (companyData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if the user is a company type
      const user = await storage.getUser(req.session.userId!);
      
      if (!user || user.type !== "company") {
        return res.status(403).json({ message: "Only company accounts can create companies" });
      }
      
      // Check if the user already has a company
      const existingCompany = await storage.getCompanyByUserId(req.session.userId!);
      
      if (existingCompany) {
        return res.status(400).json({ message: "User already has a company" });
      }
      
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating company" });
    }
  });

  apiRouter.get("/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Error fetching company" });
    }
  });

  // Opportunity routes
  apiRouter.post("/opportunities", requireAuth, async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      
      // Check if the user is a company type
      const user = await storage.getUser(req.session.userId!);
      
      if (!user || user.type !== "company") {
        return res.status(403).json({ message: "Only company accounts can create opportunities" });
      }
      
      // Check if the company belongs to the user
      const company = await storage.getCompany(opportunityData.companyId);
      
      if (!company || company.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating opportunity" });
    }
  });

  apiRouter.get("/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      
      // Get company details for each opportunity
      const opportunitiesWithCompanies = await Promise.all(
        opportunities.map(async (opportunity) => {
          const company = await storage.getCompany(opportunity.companyId);
          
          // If a user is logged in, calculate their match score for this opportunity
          let matchScore = null;
          if (req.session.userId) {
            const userType = await getUserType(req.session.userId);
            
            if (userType === "candidate") {
              const userSkills = await storage.getUserSkillsByUserId(req.session.userId);
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
      res.status(500).json({ message: "Error fetching opportunities" });
    }
  });

  apiRouter.get("/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getOpportunity(parseInt(req.params.id));
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      const company = await storage.getCompany(opportunity.companyId);
      
      // If a user is logged in, calculate their match score for this opportunity
      let matchScore = null;
      if (req.session.userId) {
        const userType = await getUserType(req.session.userId);
        
        if (userType === "candidate") {
          const userSkills = await storage.getUserSkillsByUserId(req.session.userId);
          matchScore = computeMatchScore(userSkills, opportunity.requiredSkills);
        }
      }
      
      res.json({
        ...opportunity,
        company,
        matchScore
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching opportunity" });
    }
  });

  // Application routes
  apiRouter.post("/applications", requireAuth, async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Make sure the user is applying for themselves
      if (applicationData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if the user is a candidate type
      const user = await storage.getUser(req.session.userId!);
      
      if (!user || user.type !== "candidate") {
        return res.status(403).json({ message: "Only candidate accounts can apply for opportunities" });
      }
      
      // Check if the opportunity exists
      const opportunity = await storage.getOpportunity(applicationData.opportunityId);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      // Check if the user has already applied
      const userApplications = await storage.getApplicationsByUserId(req.session.userId!);
      const existingApplication = userApplications.find(
        app => app.opportunityId === applicationData.opportunityId
      );
      
      if (existingApplication) {
        return res.status(400).json({ message: "User has already applied for this opportunity" });
      }
      
      // Calculate match score
      const userSkills = await storage.getUserSkillsByUserId(req.session.userId!);
      const matchScore = computeMatchScore(userSkills, opportunity.requiredSkills);
      
      // Create application with match score
      const application = await storage.createApplication({
        ...applicationData,
        matchScore
      });
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating application" });
    }
  });

  apiRouter.get("/applications", requireAuth, async (req, res) => {
    try {
      const userType = await getUserType(req.session.userId!);
      
      if (userType === "candidate") {
        // Candidates see their own applications
        const applications = await storage.getApplicationsByUserId(req.session.userId!);
        
        // Get opportunity and company details for each application
        const applicationsWithDetails = await Promise.all(
          applications.map(async (application) => {
            const opportunity = await storage.getOpportunity(application.opportunityId);
            const company = opportunity 
              ? await storage.getCompany(opportunity.companyId) 
              : null;
            
            return {
              ...application,
              opportunity,
              company
            };
          })
        );
        
        res.json(applicationsWithDetails);
      } else if (userType === "company") {
        // Companies see applications to their opportunities
        const company = await storage.getCompanyByUserId(req.session.userId!);
        
        if (!company) {
          return res.status(404).json({ message: "Company not found" });
        }
        
        // Get all opportunities for this company
        const opportunities = await storage.getOpportunitiesByCompanyId(company.id);
        
        // Get applications for each opportunity
        const allApplications = [];
        
        for (const opportunity of opportunities) {
          const applications = await storage.getApplicationsByOpportunityId(opportunity.id);
          
          for (const application of applications) {
            // Get anonymous candidate information
            const user = await storage.getUser(application.userId);
            
            if (user) {
              // Only add basic user info for privacy (blind review)
              allApplications.push({
                ...application,
                opportunity,
                candidate: {
                  id: user.id,
                  // Only include name if not in pending status (anonymized initially)
                  firstName: application.status !== "pending" ? user.firstName : null,
                  lastName: application.status !== "pending" ? user.lastName : null
                }
              });
            }
          }
        }
        
        res.json(allApplications);
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });

  apiRouter.put("/applications/:id/status", requireAuth, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "shortlisted", "rejected", "accepted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the application
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // For companies: verify they own the opportunity
      const userType = await getUserType(req.session.userId!);
      
      if (userType === "company") {
        const opportunity = await storage.getOpportunity(application.opportunityId);
        
        if (!opportunity) {
          return res.status(404).json({ message: "Opportunity not found" });
        }
        
        const company = await storage.getCompany(opportunity.companyId);
        
        if (!company || company.userId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } 
      // For candidates: verify it's their own application and they're only cancelling
      else if (userType === "candidate") {
        if (application.userId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // Candidates can only cancel their applications
        if (status !== "rejected") {
          return res.status(403).json({ message: "Candidates can only cancel applications" });
        }
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update application status
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application status" });
    }
  });

  // Message routes
  apiRouter.post("/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Make sure the user is sending a message from themselves
      if (messageData.senderId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if the receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Create the message
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating message" });
    }
  });

  apiRouter.get("/messages/:userId", requireAuth, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      
      // Get messages between these two users
      const messages = await storage.getMessagesBetweenUsers(
        req.session.userId!,
        otherUserId
      );
      
      // Mark received messages as read
      for (const message of messages) {
        if (message.receiverId === req.session.userId && !message.isRead) {
          await storage.updateMessage(message.id, { isRead: true });
        }
      }
      
      // Get user details
      const otherUser = await storage.getUser(otherUserId);
      
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user data
      const { password, ...otherUserWithoutPassword } = otherUser;
      
      res.json({
        messages,
        user: otherUserWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  apiRouter.get("/messages", requireAuth, async (req, res) => {
    try {
      // Get all messages sent by or received by the current user
      const sentMessages = await storage.getMessagesBySenderId(req.session.userId!);
      const receivedMessages = await storage.getMessagesByReceiverId(req.session.userId!);
      
      // Combine all messages
      const allMessages = [...sentMessages, ...receivedMessages];
      
      // Get unique user IDs who the current user has messaged with
      const userIds = new Set<number>();
      
      for (const message of allMessages) {
        if (message.senderId === req.session.userId) {
          userIds.add(message.receiverId);
        } else {
          userIds.add(message.senderId);
        }
      }
      
      // Get the latest message with each user
      const conversations = [];
      
      for (const userId of userIds) {
        const messagesWithUser = allMessages.filter(
          message => 
            (message.senderId === userId && message.receiverId === req.session.userId) ||
            (message.senderId === req.session.userId && message.receiverId === userId)
        );
        
        // Sort by sent time, most recent first
        messagesWithUser.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
        
        const latestMessage = messagesWithUser[0];
        
        // Get user details
        const user = await storage.getUser(userId);
        
        if (user) {
          // Remove password from user data
          const { password, ...userWithoutPassword } = user;
          
          // Count unread messages
          const unreadCount = messagesWithUser.filter(
            message => message.receiverId === req.session.userId && !message.isRead
          ).length;
          
          conversations.push({
            user: userWithoutPassword,
            latestMessage,
            unreadCount
          });
        }
      }
      
      // Sort conversations by latest message time
      conversations.sort((a, b) => 
        b.latestMessage.sentAt.getTime() - a.latestMessage.sentAt.getTime()
      );
      
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
