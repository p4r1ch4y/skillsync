// Storage service for serverless environment
import { eq, and, desc, asc, or, sql } from 'drizzle-orm';
import { db } from './db.js';
import {
  users, skills, userSkills, challenges, userChallenges,
  companies, opportunities, applications, messages
} from './schema.js';

/**
 * Storage interface for the TalentSync application.
 * Provides methods for interacting with the database.
 */

// User methods
export async function getUser(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByUsername(username) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function getUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function createUser(userData) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function updateUser(id, data) {
  const [updatedUser] = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
}

export async function getAllUsers() {
  return await db.select().from(users);
}

// Skill methods
export async function getSkill(id) {
  const [skill] = await db.select().from(skills).where(eq(skills.id, id));
  return skill;
}

export async function getSkillByName(name) {
  const [skill] = await db.select().from(skills).where(eq(skills.name, name));
  return skill;
}

export async function createSkill(skillData) {
  const [skill] = await db.insert(skills).values(skillData).returning();
  return skill;
}

export async function getAllSkills() {
  return await db.select().from(skills);
}

export async function getSkillsByCategory(category) {
  return await db.select().from(skills).where(eq(skills.category, category));
}

// UserSkill methods
export async function getUserSkill(id) {
  const [userSkill] = await db.select().from(userSkills).where(eq(userSkills.id, id));
  return userSkill;
}

export async function createUserSkill(userSkillData) {
  const [userSkill] = await db.insert(userSkills).values(userSkillData).returning();
  return userSkill;
}

export async function updateUserSkill(id, data) {
  const [updatedUserSkill] = await db.update(userSkills)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userSkills.id, id))
    .returning();
  return updatedUserSkill;
}

export async function getUserSkillsByUserId(userId) {
  return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
}

export async function verifyUserSkill(id, score) {
  const [updatedUserSkill] = await db.update(userSkills)
    .set({
      isVerified: true,
      score,
      verifiedAt: new Date()
    })
    .where(eq(userSkills.id, id))
    .returning();
  return updatedUserSkill;
}

// Challenge methods
export async function getChallenge(id) {
  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
  return challenge;
}

export async function createChallenge(challengeData) {
  const [challenge] = await db.insert(challenges).values(challengeData).returning();
  return challenge;
}

export async function updateChallenge(id, data) {
  const [updatedChallenge] = await db.update(challenges)
    .set(data)
    .where(eq(challenges.id, id))
    .returning();
  return updatedChallenge;
}

export async function getAllChallenges() {
  return await db.select().from(challenges);
}

export async function getChallengesBySkillId(skillId) {
  return await db.select().from(challenges).where(eq(challenges.skillId, skillId));
}

// UserChallenge methods
export async function getUserChallenge(id) {
  const [userChallenge] = await db.select().from(userChallenges).where(eq(userChallenges.id, id));
  return userChallenge;
}

export async function createUserChallenge(userChallengeData) {
  const [userChallenge] = await db.insert(userChallenges).values(userChallengeData).returning();
  return userChallenge;
}

export async function updateUserChallenge(id, data) {
  const [updatedUserChallenge] = await db.update(userChallenges)
    .set(data)
    .where(eq(userChallenges.id, id))
    .returning();
  return updatedUserChallenge;
}

export async function getUserChallengesByUserId(userId) {
  return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
}

// Company methods
export async function getCompany(id) {
  const [company] = await db.select().from(companies).where(eq(companies.id, id));
  return company;
}

export async function getCompanyByUserId(userId) {
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
  return company;
}

export async function createCompany(companyData) {
  const [company] = await db.insert(companies).values(companyData).returning();
  return company;
}

export async function updateCompany(id, data) {
  const [updatedCompany] = await db.update(companies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning();
  return updatedCompany;
}

export async function getAllCompanies() {
  return await db.select().from(companies);
}

// Opportunity methods
export async function getOpportunity(id) {
  const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  return opportunity;
}

export async function createOpportunity(opportunityData) {
  const [opportunity] = await db.insert(opportunities).values(opportunityData).returning();
  return opportunity;
}

export async function updateOpportunity(id, data) {
  const [updatedOpportunity] = await db.update(opportunities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(opportunities.id, id))
    .returning();
  return updatedOpportunity;
}

export async function getAllOpportunities() {
  return await db.select().from(opportunities);
}

export async function getOpportunitiesByCompanyId(companyId) {
  return await db.select().from(opportunities).where(eq(opportunities.companyId, companyId));
}

// Application methods
export async function getApplication(id) {
  const [application] = await db.select().from(applications).where(eq(applications.id, id));
  return application;
}

export async function createApplication(applicationData) {
  const [application] = await db.insert(applications).values(applicationData).returning();
  return application;
}

export async function updateApplication(id, data) {
  const [updatedApplication] = await db.update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning();
  return updatedApplication;
}

export async function getApplicationsByUserId(userId) {
  return await db.select().from(applications).where(eq(applications.userId, userId));
}

export async function getApplicationsByOpportunityId(opportunityId) {
  return await db.select().from(applications).where(eq(applications.opportunityId, opportunityId));
}

// Message methods
export async function getMessage(id) {
  const [message] = await db.select().from(messages).where(eq(messages.id, id));
  return message;
}

export async function createMessage(messageData) {
  const [message] = await db.insert(messages).values(messageData).returning();
  return message;
}

export async function updateMessage(id, data) {
  const [updatedMessage] = await db.update(messages)
    .set(data)
    .where(eq(messages.id, id))
    .returning();
  return updatedMessage;
}

export async function getMessagesBySenderId(senderId) {
  return await db.select().from(messages).where(eq(messages.senderId, senderId));
}

export async function getMessagesByReceiverId(receiverId) {
  return await db.select().from(messages).where(eq(messages.receiverId, receiverId));
}

export async function getMessagesBetweenUsers(user1Id, user2Id) {
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
  ).orderBy(asc(messages.sentAt));
}

// Export all storage methods
export const storage = {
  getUser,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  getAllUsers,

  getSkill,
  getSkillByName,
  createSkill,
  getAllSkills,
  getSkillsByCategory,

  getUserSkill,
  createUserSkill,
  updateUserSkill,
  getUserSkillsByUserId,
  verifyUserSkill,

  getChallenge,
  createChallenge,
  updateChallenge,
  getAllChallenges,
  getChallengesBySkillId,

  getUserChallenge,
  createUserChallenge,
  updateUserChallenge,
  getUserChallengesByUserId,

  getCompany,
  getCompanyByUserId,
  createCompany,
  updateCompany,
  getAllCompanies,

  getOpportunity,
  createOpportunity,
  updateOpportunity,
  getAllOpportunities,
  getOpportunitiesByCompanyId,

  getApplication,
  createApplication,
  updateApplication,
  getApplicationsByUserId,
  getApplicationsByOpportunityId,

  getMessage,
  createMessage,
  updateMessage,
  getMessagesBySenderId,
  getMessagesByReceiverId,
  getMessagesBetweenUsers
};
