import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  bio: text("bio"),
  type: text("type").notNull().default("candidate"), // 'candidate' or 'company'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Skill model
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

// UserSkill model to track verified skills
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  score: decimal("score").notNull(), // Normalized score between 0-100
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  verifiedAt: true,
});

// Challenge model
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  timeEstimate: integer("time_estimate").notNull(), // in minutes
  isAutomated: boolean("is_automated").notNull().default(true),
  content: jsonb("content").notNull(), // JSON with challenge details
  scoringCriteria: jsonb("scoring_criteria").notNull(), // JSON with scoring criteria
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

// UserChallenge model to track challenge submissions
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  submission: jsonb("submission"), // JSON with submission content
  score: decimal("score"), // Score out of 100
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  score: true,
  status: true,
  startedAt: true,
  completedAt: true,
});

// Company model
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  website: text("website"),
  cultureDescription: text("culture_description"),
  cultureMetrics: jsonb("culture_metrics"), // JSON with culture metrics
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

// Job Opportunity model
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  locationType: text("location_type").notNull(), // 'remote', 'onsite', 'hybrid'
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  salaryPeriod: text("salary_period").notNull().default("yearly"), // 'yearly', 'monthly', 'hourly'
  employmentType: text("employment_type").notNull(), // 'full-time', 'part-time', 'contract'
  requiredSkills: jsonb("required_skills").notNull(), // Array of skill IDs
  workSample: jsonb("work_sample").notNull(), // JSON with work sample details
  status: text("status").notNull().default("active"), // 'active', 'filled', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Application model
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  matchScore: decimal("match_score").notNull(), // Calculated match score
  status: text("status").notNull().default("pending"), // 'pending', 'shortlisted', 'rejected', 'accepted'
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
});

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  sentAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
