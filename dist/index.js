var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import session from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  applications: () => applications,
  challenges: () => challenges,
  companies: () => companies,
  insertApplicationSchema: () => insertApplicationSchema,
  insertChallengeSchema: () => insertChallengeSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertMessageSchema: () => insertMessageSchema,
  insertOpportunitySchema: () => insertOpportunitySchema,
  insertSkillSchema: () => insertSkillSchema,
  insertUserChallengeSchema: () => insertUserChallengeSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSkillSchema: () => insertUserSkillSchema,
  messages: () => messages,
  opportunities: () => opportunities,
  skills: () => skills,
  userChallenges: () => userChallenges,
  userSkills: () => userSkills,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  bio: text("bio"),
  type: text("type").notNull().default("candidate"),
  // 'candidate' or 'company'
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull()
});
var insertSkillSchema = createInsertSchema(skills).omit({
  id: true
});
var userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  score: decimal("score").notNull(),
  // Normalized score between 0-100
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at")
});
var insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  verifiedAt: true
});
var challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  difficulty: text("difficulty").notNull(),
  // 'beginner', 'intermediate', 'advanced'
  timeEstimate: integer("time_estimate").notNull(),
  // in minutes
  isAutomated: boolean("is_automated").notNull().default(true),
  content: jsonb("content").notNull(),
  // JSON with challenge details
  scoringCriteria: jsonb("scoring_criteria").notNull()
  // JSON with scoring criteria
});
var insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true
});
var userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  submission: jsonb("submission"),
  // JSON with submission content
  score: decimal("score"),
  // Score out of 100
  status: text("status").notNull().default("pending"),
  // 'pending', 'completed', 'failed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  score: true,
  status: true,
  startedAt: true,
  completedAt: true
});
var companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  website: text("website"),
  cultureDescription: text("culture_description"),
  cultureMetrics: jsonb("culture_metrics")
  // JSON with culture metrics
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true
});
var opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  locationType: text("location_type").notNull(),
  // 'remote', 'onsite', 'hybrid'
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  salaryPeriod: text("salary_period").notNull().default("yearly"),
  // 'yearly', 'monthly', 'hourly'
  employmentType: text("employment_type").notNull(),
  // 'full-time', 'part-time', 'contract'
  requiredSkills: jsonb("required_skills").notNull(),
  // Array of skill IDs
  workSample: jsonb("work_sample").notNull(),
  // JSON with work sample details
  status: text("status").notNull().default("active"),
  // 'active', 'filled', 'closed'
  createdAt: timestamp("created_at").defaultNow()
});
var insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  status: true,
  createdAt: true
});
var applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  matchScore: decimal("match_score").notNull(),
  // Calculated match score
  status: text("status").notNull().default("pending"),
  // 'pending', 'shortlisted', 'rejected', 'accepted'
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
var insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow()
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  sentAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, or } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, data) {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async getSkill(id) {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }
  async getSkillByName(name) {
    const [skill] = await db.select().from(skills).where(eq(skills.name, name));
    return skill;
  }
  async createSkill(insertSkill) {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }
  async getAllSkills() {
    return await db.select().from(skills);
  }
  async getSkillsByCategory(category) {
    return await db.select().from(skills).where(eq(skills.category, category));
  }
  async getUserSkill(id) {
    const [userSkill] = await db.select().from(userSkills).where(eq(userSkills.id, id));
    return userSkill;
  }
  async createUserSkill(insertUserSkill) {
    const skillData = {
      ...insertUserSkill,
      isVerified: false,
      score: insertUserSkill.score || "0"
    };
    const [userSkill] = await db.insert(userSkills).values(skillData).returning();
    return userSkill;
  }
  async updateUserSkill(id, data) {
    const [updatedUserSkill] = await db.update(userSkills).set(data).where(eq(userSkills.id, id)).returning();
    return updatedUserSkill;
  }
  async getUserSkillsByUserId(userId) {
    return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }
  async verifyUserSkill(id, score) {
    const now = /* @__PURE__ */ new Date();
    const [verifiedUserSkill] = await db.update(userSkills).set({
      score: String(score),
      // Convert number to string for the decimal field
      isVerified: true,
      verifiedAt: now
    }).where(eq(userSkills.id, id)).returning();
    return verifiedUserSkill;
  }
  async getChallenge(id) {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }
  async createChallenge(insertChallenge) {
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
    return challenge;
  }
  async updateChallenge(id, data) {
    const [updatedChallenge] = await db.update(challenges).set(data).where(eq(challenges.id, id)).returning();
    return updatedChallenge;
  }
  async getAllChallenges() {
    return await db.select().from(challenges);
  }
  async getChallengesBySkillId(skillId) {
    return await db.select().from(challenges).where(eq(challenges.skillId, skillId));
  }
  async getUserChallenge(id) {
    const [userChallenge] = await db.select().from(userChallenges).where(eq(userChallenges.id, id));
    return userChallenge;
  }
  async createUserChallenge(insertUserChallenge) {
    const now = /* @__PURE__ */ new Date();
    const [userChallenge] = await db.insert(userChallenges).values({
      ...insertUserChallenge,
      status: "pending",
      startedAt: now,
      score: null
    }).returning();
    return userChallenge;
  }
  async updateUserChallenge(id, data) {
    const [updatedUserChallenge] = await db.update(userChallenges).set(data).where(eq(userChallenges.id, id)).returning();
    return updatedUserChallenge;
  }
  async getUserChallengesByUserId(userId) {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }
  async getCompany(id) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  async getCompanyByUserId(userId) {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }
  async createCompany(insertCompany) {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async updateCompany(id, data) {
    const [updatedCompany] = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return updatedCompany;
  }
  async getAllCompanies() {
    return await db.select().from(companies);
  }
  async getOpportunity(id) {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }
  async createOpportunity(insertOpportunity) {
    const now = /* @__PURE__ */ new Date();
    const [opportunity] = await db.insert(opportunities).values({
      ...insertOpportunity,
      status: "active",
      createdAt: now
    }).returning();
    return opportunity;
  }
  async updateOpportunity(id, data) {
    const [updatedOpportunity] = await db.update(opportunities).set(data).where(eq(opportunities.id, id)).returning();
    return updatedOpportunity;
  }
  async getAllOpportunities() {
    return await db.select().from(opportunities).where(eq(opportunities.status, "active"));
  }
  async getOpportunitiesByCompanyId(companyId) {
    return await db.select().from(opportunities).where(eq(opportunities.companyId, companyId));
  }
  async getApplication(id) {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }
  async createApplication(insertApplication) {
    const now = /* @__PURE__ */ new Date();
    const [application] = await db.insert(applications).values({
      ...insertApplication,
      status: "pending",
      appliedAt: now
    }).returning();
    return application;
  }
  async updateApplication(id, data) {
    const now = /* @__PURE__ */ new Date();
    const [updatedApplication] = await db.update(applications).set({
      ...data,
      updatedAt: now
    }).where(eq(applications.id, id)).returning();
    return updatedApplication;
  }
  async getApplicationsByUserId(userId) {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }
  async getApplicationsByOpportunityId(opportunityId) {
    return await db.select().from(applications).where(eq(applications.opportunityId, opportunityId));
  }
  async getMessage(id) {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  async createMessage(insertMessage) {
    const now = /* @__PURE__ */ new Date();
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      isRead: false,
      sentAt: now
    }).returning();
    return message;
  }
  async updateMessage(id, data) {
    const [updatedMessage] = await db.update(messages).set(data).where(eq(messages.id, id)).returning();
    return updatedMessage;
  }
  async getMessagesBySenderId(senderId) {
    return await db.select().from(messages).where(eq(messages.senderId, senderId)).orderBy(desc(messages.sentAt));
  }
  async getMessagesByReceiverId(receiverId) {
    return await db.select().from(messages).where(eq(messages.receiverId, receiverId)).orderBy(desc(messages.sentAt));
  }
  async getMessagesBetweenUsers(user1Id, user2Id) {
    return await db.select().from(messages).where(
      or(
        and(
          eq(messages.senderId, user1Id),
          eq(messages.receiverId, user2Id)
        ),
        and(
          eq(messages.senderId, user2Id),
          eq(messages.receiverId, user1Id)
        )
      )
    ).orderBy(desc(messages.sentAt));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
import bcrypt from "bcrypt";

// shared/skillMatching.ts
function computeMatchScore(userSkills2, requiredSkills) {
  if (!requiredSkills.length) return 0;
  let totalMatchScore = 0;
  const skillWeight = 100 / requiredSkills.length;
  for (const requiredSkillId of requiredSkills) {
    const userSkill = userSkills2.find((skill) => skill.skillId === requiredSkillId);
    if (userSkill) {
      if (userSkill.isVerified) {
        totalMatchScore += userSkill.score * skillWeight / 100;
      } else {
        totalMatchScore += skillWeight * 0.2;
      }
    }
  }
  return Math.round(totalMatchScore);
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "skillsync_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1e3 * 60 * 60 * 24
        // 1 day
      }
    })
  );
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  const getUserType = async (userId) => {
    const user = await storage.getUser(userId);
    return user?.type || "candidate";
  };
  const apiRouter = express.Router();
  app2.use("/api", apiRouter);
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
      if (!user || !await bcrypt.compare(password, user.password)) {
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
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  apiRouter.get("/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to user data" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
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
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to update this user" });
      }
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
      const updatedUser = await storage.updateUser(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
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
  apiRouter.get("/skills", async (req, res) => {
    try {
      const skills2 = await storage.getAllSkills();
      res.json(skills2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching skills" });
    }
  });
  apiRouter.get("/user-skills", requireAuth, async (req, res) => {
    try {
      const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
      const skillsWithDetails = await Promise.all(
        userSkills2.map(async (userSkill) => {
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
      if (userSkillData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const skill = await storage.getSkill(userSkillData.skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
      const existingSkill = userSkills2.find((us) => us.skillId === userSkillData.skillId);
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
  apiRouter.get("/challenges", async (req, res) => {
    try {
      const challenges2 = await storage.getAllChallenges();
      const challengesWithSkills = await Promise.all(
        challenges2.map(async (challenge) => {
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
      const skill = await storage.getSkill(challenge.skillId);
      res.json({
        ...challenge,
        skill
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenge" });
    }
  });
  apiRouter.post("/user-challenges", requireAuth, async (req, res) => {
    try {
      const userChallengeData = insertUserChallengeSchema.parse(req.body);
      if (userChallengeData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
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
      const userChallenge = await storage.getUserChallenge(userChallengeId);
      if (!userChallenge) {
        return res.status(404).json({ message: "User challenge not found" });
      }
      if (userChallenge.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const challenge = await storage.getChallenge(userChallenge.challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      const score = Math.floor(Math.random() * 51) + 50;
      const now = /* @__PURE__ */ new Date();
      const updatedUserChallenge = await storage.updateUserChallenge(userChallengeId, {
        submission,
        score,
        status: "completed",
        completedAt: now
      });
      const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
      const userSkill = userSkills2.find((us) => us.skillId === challenge.skillId);
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
      const userChallenges2 = await storage.getUserChallengesByUserId(req.session.userId);
      const challengesWithDetails = await Promise.all(
        userChallenges2.map(async (userChallenge) => {
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
  apiRouter.post("/companies", requireAuth, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      if (companyData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || user.type !== "company") {
        return res.status(403).json({ message: "Only company accounts can create companies" });
      }
      const existingCompany = await storage.getCompanyByUserId(req.session.userId);
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
  apiRouter.post("/opportunities", requireAuth, async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const user = await storage.getUser(req.session.userId);
      if (!user || user.type !== "company") {
        return res.status(403).json({ message: "Only company accounts can create opportunities" });
      }
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
      const opportunities2 = await storage.getAllOpportunities();
      const opportunitiesWithCompanies = await Promise.all(
        opportunities2.map(async (opportunity) => {
          const company = await storage.getCompany(opportunity.companyId);
          let matchScore = null;
          if (req.session.userId) {
            const userType = await getUserType(req.session.userId);
            if (userType === "candidate") {
              const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
              matchScore = computeMatchScore(userSkills2, opportunity.requiredSkills);
            }
          }
          return {
            ...opportunity,
            company,
            matchScore
          };
        })
      );
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
      let matchScore = null;
      if (req.session.userId) {
        const userType = await getUserType(req.session.userId);
        if (userType === "candidate") {
          const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
          matchScore = computeMatchScore(userSkills2, opportunity.requiredSkills);
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
  apiRouter.post("/applications", requireAuth, async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      if (applicationData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || user.type !== "candidate") {
        return res.status(403).json({ message: "Only candidate accounts can apply for opportunities" });
      }
      const opportunity = await storage.getOpportunity(applicationData.opportunityId);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      const userApplications = await storage.getApplicationsByUserId(req.session.userId);
      const existingApplication = userApplications.find(
        (app3) => app3.opportunityId === applicationData.opportunityId
      );
      if (existingApplication) {
        return res.status(400).json({ message: "User has already applied for this opportunity" });
      }
      const userSkills2 = await storage.getUserSkillsByUserId(req.session.userId);
      const matchScore = computeMatchScore(userSkills2, opportunity.requiredSkills);
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
      const userType = await getUserType(req.session.userId);
      if (userType === "candidate") {
        const applications2 = await storage.getApplicationsByUserId(req.session.userId);
        const applicationsWithDetails = await Promise.all(
          applications2.map(async (application) => {
            const opportunity = await storage.getOpportunity(application.opportunityId);
            const company = opportunity ? await storage.getCompany(opportunity.companyId) : null;
            return {
              ...application,
              opportunity,
              company
            };
          })
        );
        res.json(applicationsWithDetails);
      } else if (userType === "company") {
        const company = await storage.getCompanyByUserId(req.session.userId);
        if (!company) {
          return res.status(404).json({ message: "Company not found" });
        }
        const opportunities2 = await storage.getOpportunitiesByCompanyId(company.id);
        const allApplications = [];
        for (const opportunity of opportunities2) {
          const applications2 = await storage.getApplicationsByOpportunityId(opportunity.id);
          for (const application of applications2) {
            const user = await storage.getUser(application.userId);
            if (user) {
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
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const userType = await getUserType(req.session.userId);
      if (userType === "company") {
        const opportunity = await storage.getOpportunity(application.opportunityId);
        if (!opportunity) {
          return res.status(404).json({ message: "Opportunity not found" });
        }
        const company = await storage.getCompany(opportunity.companyId);
        if (!company || company.userId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (userType === "candidate") {
        if (application.userId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        if (status !== "rejected") {
          return res.status(403).json({ message: "Candidates can only cancel applications" });
        }
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application status" });
    }
  });
  apiRouter.post("/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      if (messageData.senderId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
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
      const messages2 = await storage.getMessagesBetweenUsers(
        req.session.userId,
        otherUserId
      );
      for (const message of messages2) {
        if (message.receiverId === req.session.userId && !message.isRead) {
          await storage.updateMessage(message.id, { isRead: true });
        }
      }
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...otherUserWithoutPassword } = otherUser;
      res.json({
        messages: messages2,
        user: otherUserWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  apiRouter.get("/messages", requireAuth, async (req, res) => {
    try {
      const sentMessages = await storage.getMessagesBySenderId(req.session.userId);
      const receivedMessages = await storage.getMessagesByReceiverId(req.session.userId);
      const allMessages = [...sentMessages, ...receivedMessages];
      const userIds = /* @__PURE__ */ new Set();
      for (const message of allMessages) {
        if (message.senderId === req.session.userId) {
          userIds.add(message.receiverId);
        } else {
          userIds.add(message.senderId);
        }
      }
      const conversations = [];
      for (const userId of userIds) {
        const messagesWithUser = allMessages.filter(
          (message) => message.senderId === userId && message.receiverId === req.session.userId || message.senderId === req.session.userId && message.receiverId === userId
        );
        messagesWithUser.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
        const latestMessage = messagesWithUser[0];
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          const unreadCount = messagesWithUser.filter(
            (message) => message.receiverId === req.session.userId && !message.isRead
          ).length;
          conversations.push({
            user: userWithoutPassword,
            latestMessage,
            unreadCount
          });
        }
      }
      conversations.sort(
        (a, b) => b.latestMessage.sentAt.getTime() - a.latestMessage.sentAt.getTime()
      );
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        path2.dirname(import.meta.url.replace("file://", "")),
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const staticPath = path2.resolve(process.cwd(), "dist/public");
  console.log(`Attempting to serve static files from: ${staticPath}`);
  if (!fs.existsSync(staticPath)) {
    console.warn(`Static path does not exist: ${staticPath}`);
    console.warn("This is expected in some environments like Vercel. Continuing...");
  }
  app2.use(express2.static(staticPath));
  app2.use("*", (_req, res) => {
    const indexPath = path2.join(staticPath, "index.html");
    try {
      if (fs.existsSync(indexPath)) {
        console.log(`Serving index.html from: ${indexPath}`);
        res.sendFile(indexPath);
      } else {
        console.warn(`Index.html not found at: ${indexPath}`);
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>TalentSync</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script type="module" src="/assets/index-D5kg3YhS.js"></script>
              <link rel="stylesheet" href="/assets/index-DtX4t95D.css">
            </head>
            <body>
              <div id="root"></div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Error serving index.html:", error);
      res.status(500).send("Server error");
    }
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
