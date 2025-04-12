import {
  users, skills, userSkills, challenges, userChallenges, companies, opportunities, applications, messages,
  type User, type InsertUser, type Skill, type InsertSkill, type UserSkill, type InsertUserSkill,
  type Challenge, type InsertChallenge, type UserChallenge, type InsertUserChallenge,
  type Company, type InsertCompany, type Opportunity, type InsertOpportunity,
  type Application, type InsertApplication, type Message, type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Skill methods
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillByName(name: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getAllSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  
  // UserSkill methods
  getUserSkill(id: number): Promise<UserSkill | undefined>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(id: number, data: Partial<InsertUserSkill>): Promise<UserSkill | undefined>;
  getUserSkillsByUserId(userId: number): Promise<UserSkill[]>;
  verifyUserSkill(id: number, score: number): Promise<UserSkill | undefined>;
  
  // Challenge methods
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  getChallengesBySkillId(skillId: number): Promise<Challenge[]>;
  
  // UserChallenge methods
  getUserChallenge(id: number): Promise<UserChallenge | undefined>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined>;
  getUserChallengesByUserId(userId: number): Promise<UserChallenge[]>;
  
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  
  // Opportunity methods
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunitiesByCompanyId(companyId: number): Promise<Opportunity[]>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, data: Partial<Application>): Promise<Application | undefined>;
  getApplicationsByUserId(userId: number): Promise<Application[]>;
  getApplicationsByOpportunityId(opportunityId: number): Promise<Application[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined>;
  getMessagesBySenderId(senderId: number): Promise<Message[]>;
  getMessagesByReceiverId(receiverId: number): Promise<Message[]>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private userSkills: Map<number, UserSkill>;
  private challenges: Map<number, Challenge>;
  private userChallenges: Map<number, UserChallenge>;
  private companies: Map<number, Company>;
  private opportunities: Map<number, Opportunity>;
  private applications: Map<number, Application>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private skillIdCounter: number;
  private userSkillIdCounter: number;
  private challengeIdCounter: number;
  private userChallengeIdCounter: number;
  private companyIdCounter: number;
  private opportunityIdCounter: number;
  private applicationIdCounter: number;
  private messageIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.companies = new Map();
    this.opportunities = new Map();
    this.applications = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.userSkillIdCounter = 1;
    this.challengeIdCounter = 1;
    this.userChallengeIdCounter = 1;
    this.companyIdCounter = 1;
    this.opportunityIdCounter = 1;
    this.applicationIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add sample skills
    const skillNames = [
      { name: "JavaScript", category: "Programming" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "TypeScript", category: "Programming" },
      { name: "Express", category: "Backend" },
      { name: "MongoDB", category: "Database" },
      { name: "UI Design", category: "Design" },
      { name: "GraphQL", category: "API" },
      { name: "Redux", category: "Frontend" },
      { name: "AWS", category: "DevOps" },
      { name: "Python", category: "Programming" },
      { name: "SQL", category: "Database" },
      { name: "Java", category: "Programming" },
      { name: "C#", category: "Programming" },
      { name: "PHP", category: "Programming" }
    ];
    
    skillNames.forEach(skill => this.createSkill(skill));
    
    // Add sample challenges
    const sampleChallenges = [
      {
        title: "API Integration Challenge",
        description: "Build a RESTful API client to fetch and display data from a public API.",
        skillId: 1, // JavaScript
        difficulty: "intermediate",
        timeEstimate: 45,
        isAutomated: true,
        content: {
          instructions: "Create a function that fetches data from a REST API and formats it for display.",
          tests: ["Test API response parsing", "Test error handling", "Test formatting"]
        },
        scoringCriteria: {
          functionality: 40,
          codeQuality: 30,
          performance: 20,
          errorHandling: 10
        }
      },
      {
        title: "State Management Challenge",
        description: "Build a React application that manages complex state with Context API or Redux.",
        skillId: 2, // React
        difficulty: "advanced",
        timeEstimate: 60,
        isAutomated: true,
        content: {
          instructions: "Create a React app with multiple components that share state.",
          tests: ["Test state updates", "Test component re-rendering", "Test side effects"]
        },
        scoringCriteria: {
          stateArchitecture: 30,
          componentDesign: 30,
          performance: 20,
          codeQuality: 20
        }
      },
      {
        title: "Responsive Dashboard Design",
        description: "Design a responsive dashboard interface for a data visualization application.",
        skillId: 7, // UI Design
        difficulty: "intermediate",
        timeEstimate: 90,
        isAutomated: false,
        content: {
          instructions: "Create a responsive dashboard that works well on all device sizes.",
          deliverables: ["Desktop mockup", "Mobile mockup", "Component structure"]
        },
        scoringCriteria: {
          visualDesign: 30,
          responsiveness: 30,
          usability: 25,
          accessibility: 15
        }
      }
    ];
    
    sampleChallenges.forEach(challenge => this.createChallenge(challenge));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Skill methods
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async getSkillByName(name: string): Promise<Skill | undefined> {
    return Array.from(this.skills.values()).find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const skill: Skill = { ...insertSkill, id };
    this.skills.set(id, skill);
    return skill;
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      skill => skill.category === category
    );
  }
  
  // UserSkill methods
  async getUserSkill(id: number): Promise<UserSkill | undefined> {
    return this.userSkills.get(id);
  }
  
  async createUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillIdCounter++;
    const userSkill: UserSkill = { ...insertUserSkill, id, verifiedAt: null };
    this.userSkills.set(id, userSkill);
    return userSkill;
  }
  
  async updateUserSkill(id: number, data: Partial<InsertUserSkill>): Promise<UserSkill | undefined> {
    const userSkill = await this.getUserSkill(id);
    if (!userSkill) return undefined;
    
    const updatedUserSkill = { ...userSkill, ...data };
    this.userSkills.set(id, updatedUserSkill);
    return updatedUserSkill;
  }
  
  async getUserSkillsByUserId(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      userSkill => userSkill.userId === userId
    );
  }
  
  async verifyUserSkill(id: number, score: number): Promise<UserSkill | undefined> {
    const userSkill = await this.getUserSkill(id);
    if (!userSkill) return undefined;
    
    const now = new Date();
    const verifiedUserSkill: UserSkill = {
      ...userSkill,
      score,
      isVerified: true,
      verifiedAt: now
    };
    
    this.userSkills.set(id, verifiedUserSkill);
    return verifiedUserSkill;
  }
  
  // Challenge methods
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }
  
  async updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const challenge = await this.getChallenge(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { ...challenge, ...data };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }
  
  async getChallengesBySkillId(skillId: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      challenge => challenge.skillId === skillId
    );
  }
  
  // UserChallenge methods
  async getUserChallenge(id: number): Promise<UserChallenge | undefined> {
    return this.userChallenges.get(id);
  }
  
  async createUserChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = this.userChallengeIdCounter++;
    const now = new Date();
    const userChallenge: UserChallenge = {
      ...insertUserChallenge,
      id,
      score: null,
      status: "pending",
      startedAt: now,
      completedAt: null
    };
    this.userChallenges.set(id, userChallenge);
    return userChallenge;
  }
  
  async updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const userChallenge = await this.getUserChallenge(id);
    if (!userChallenge) return undefined;
    
    const updatedUserChallenge = { ...userChallenge, ...data };
    this.userChallenges.set(id, updatedUserChallenge);
    return updatedUserChallenge;
  }
  
  async getUserChallengesByUserId(userId: number): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values()).filter(
      userChallenge => userChallenge.userId === userId
    );
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      company => company.userId === userId
    );
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const company: Company = { ...insertCompany, id };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = await this.getCompany(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...data };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  // Opportunity methods
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }
  
  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityIdCounter++;
    const now = new Date();
    const opportunity: Opportunity = {
      ...insertOpportunity,
      id,
      status: "active",
      createdAt: now
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }
  
  async updateOpportunity(id: number, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = { ...opportunity, ...data };
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }
  
  async getAllOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values());
  }
  
  async getOpportunitiesByCompanyId(companyId: number): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).filter(
      opportunity => opportunity.companyId === companyId
    );
  }
  
  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const application: Application = {
      ...insertApplication,
      id,
      status: "pending",
      appliedAt: now,
      updatedAt: now
    };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplication(id: number, data: Partial<Application>): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;
    
    const now = new Date();
    const updatedApplication = { ...application, ...data, updatedAt: now };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      application => application.userId === userId
    );
  }
  
  async getApplicationsByOpportunityId(opportunityId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      application => application.opportunityId === opportunityId
    );
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      sentAt: now
    };
    this.messages.set(id, message);
    return message;
  }
  
  async updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...data };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async getMessagesBySenderId(senderId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.senderId === senderId
    );
  }
  
  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.receiverId === receiverId
    );
  }
  
  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
}

// Replace MemStorage with DatabaseStorage

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async getSkillByName(name: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.name, name));
    return skill;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.category, category));
  }

  async getUserSkill(id: number): Promise<UserSkill | undefined> {
    const [userSkill] = await db.select().from(userSkills).where(eq(userSkills.id, id));
    return userSkill;
  }

  async createUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    // Ensure a default score is provided if not in the input
    const skillData = {
      ...insertUserSkill,
      isVerified: false,
      score: insertUserSkill.score || "0"
    };
    
    const [userSkill] = await db.insert(userSkills)
      .values(skillData)
      .returning();
    return userSkill;
  }

  async updateUserSkill(id: number, data: Partial<InsertUserSkill>): Promise<UserSkill | undefined> {
    const [updatedUserSkill] = await db.update(userSkills)
      .set(data)
      .where(eq(userSkills.id, id))
      .returning();
    return updatedUserSkill;
  }

  async getUserSkillsByUserId(userId: number): Promise<UserSkill[]> {
    return await db.select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  async verifyUserSkill(id: number, score: number): Promise<UserSkill | undefined> {
    const now = new Date();
    const [verifiedUserSkill] = await db.update(userSkills)
      .set({
        score: String(score), // Convert number to string for the decimal field
        isVerified: true,
        verifiedAt: now
      })
      .where(eq(userSkills.id, id))
      .returning();
    return verifiedUserSkill;
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const [updatedChallenge] = await db.update(challenges)
      .set(data)
      .where(eq(challenges.id, id))
      .returning();
    return updatedChallenge;
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getChallengesBySkillId(skillId: number): Promise<Challenge[]> {
    return await db.select()
      .from(challenges)
      .where(eq(challenges.skillId, skillId));
  }

  async getUserChallenge(id: number): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db.select()
      .from(userChallenges)
      .where(eq(userChallenges.id, id));
    return userChallenge;
  }

  async createUserChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const now = new Date();
    const [userChallenge] = await db.insert(userChallenges)
      .values({
        ...insertUserChallenge,
        status: "pending",
        startedAt: now,
        score: null
      })
      .returning();
    return userChallenge;
  }

  async updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const [updatedUserChallenge] = await db.update(userChallenges)
      .set(data)
      .where(eq(userChallenges.id, id))
      .returning();
    return updatedUserChallenge;
  }

  async getUserChallengesByUserId(userId: number): Promise<UserChallenge[]> {
    return await db.select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select()
      .from(companies)
      .where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [company] = await db.select()
      .from(companies)
      .where(eq(companies.userId, userId));
    return company;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select()
      .from(opportunities)
      .where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const now = new Date();
    const [opportunity] = await db.insert(opportunities)
      .values({
        ...insertOpportunity,
        status: "active",
        createdAt: now
      })
      .returning();
    return opportunity;
  }

  async updateOpportunity(id: number, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [updatedOpportunity] = await db.update(opportunities)
      .set(data)
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db.select()
      .from(opportunities)
      .where(eq(opportunities.status, "active"));
  }

  async getOpportunitiesByCompanyId(companyId: number): Promise<Opportunity[]> {
    return await db.select()
      .from(opportunities)
      .where(eq(opportunities.companyId, companyId));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select()
      .from(applications)
      .where(eq(applications.id, id));
    return application;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const now = new Date();
    const [application] = await db.insert(applications)
      .values({
        ...insertApplication,
        status: "pending",
        appliedAt: now,
      })
      .returning();
    return application;
  }

  async updateApplication(id: number, data: Partial<Application>): Promise<Application | undefined> {
    const now = new Date();
    const [updatedApplication] = await db.update(applications)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .where(eq(applications.userId, userId));
  }

  async getApplicationsByOpportunityId(opportunityId: number): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .where(eq(applications.opportunityId, opportunityId));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const now = new Date();
    const [message] = await db.insert(messages)
      .values({
        ...insertMessage,
        isRead: false,
        sentAt: now
      })
      .returning();
    return message;
  }

  async updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set(data)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  async getMessagesBySenderId(senderId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.senderId, senderId))
      .orderBy(desc(messages.sentAt));
  }

  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.receiverId, receiverId))
      .orderBy(desc(messages.sentAt));
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
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
      )
      .orderBy(desc(messages.sentAt));
  }
}

export const storage = new DatabaseStorage();
