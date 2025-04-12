// Database schema
import { pgTable, serial, text, varchar, timestamp, boolean, integer, jsonb, decimal } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).default('candidate').notNull(),
  bio: text('bio'),
  title: varchar('title', { length: 100 }),
  location: varchar('location', { length: 100 }),
  education: text('education'),
  experience: text('experience'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  profileCompleted: boolean('profile_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Skills table
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull()
});

// User Skills table
export const userSkills = pgTable('user_skills', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  skillId: integer('skill_id').notNull().references(() => skills.id),
  score: decimal('score').notNull(), // Normalized score between 0-100
  isVerified: boolean('is_verified').notNull().default(false),
  verifiedAt: timestamp('verified_at')
});

// Challenges table
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  skillId: integer('skill_id').notNull().references(() => skills.id),
  difficulty: varchar('difficulty', { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  timeEstimate: integer('time_estimate').notNull(), // in minutes
  isAutomated: boolean('is_automated').notNull().default(true),
  content: jsonb('content').notNull(), // JSON with challenge details
  scoringCriteria: jsonb('scoring_criteria').notNull() // JSON with scoring criteria
});

// User Challenges table
export const userChallenges = pgTable('user_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id),
  submission: jsonb('submission'), // JSON with submission content
  score: decimal('score'), // Score out of 100
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'failed'
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

// Companies table
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  name: varchar('name', { length: 100 }).notNull(),
  industry: varchar('industry', { length: 50 }).notNull(),
  location: varchar('location', { length: 100 }).notNull(),
  website: varchar('website', { length: 255 }),
  cultureDescription: text('culture_description'),
  cultureMetrics: jsonb('culture_metrics') // JSON with culture metrics
});

// Opportunities table
export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 100 }).notNull(),
  locationType: varchar('location_type', { length: 50 }).notNull(), // 'remote', 'onsite', 'hybrid'
  salaryMin: integer('salary_min').notNull(),
  salaryMax: integer('salary_max').notNull(),
  salaryPeriod: varchar('salary_period', { length: 20 }).notNull().default('yearly'), // 'yearly', 'monthly', 'hourly'
  employmentType: varchar('employment_type', { length: 50 }).notNull(), // 'full-time', 'part-time', 'contract'
  requiredSkills: jsonb('required_skills').notNull(), // Array of skill IDs
  workSample: jsonb('work_sample').notNull(), // JSON with work sample details
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'filled', 'closed'
  createdAt: timestamp('created_at').defaultNow()
});

// Applications table
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  opportunityId: integer('opportunity_id').notNull().references(() => opportunities.id),
  matchScore: decimal('match_score').notNull(), // Calculated match score
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'shortlisted', 'rejected', 'accepted'
  appliedAt: timestamp('applied_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  sentAt: timestamp('sent_at').defaultNow()
});

// Export all schemas
export const schema = {
  users,
  skills,
  userSkills,
  challenges,
  userChallenges,
  companies,
  opportunities,
  applications,
  messages
};
