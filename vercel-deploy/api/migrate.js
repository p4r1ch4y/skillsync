// Database migration script
import { sql } from './db.js';

// Create users table if it doesn't exist
async function createUsersTable() {
  try {
    console.log('Creating users table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'candidate',
        bio TEXT,
        title VARCHAR(100),
        location VARCHAR(100),
        education TEXT,
        experience TEXT,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        profile_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    console.log('Users table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating users table:', error);
    return { success: false, error: error.message };
  }
}

// Create skills table if it doesn't exist
async function createSkillsTable() {
  try {
    console.log('Creating skills table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL
      );
    `;

    console.log('Skills table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating skills table:', error);
    return { success: false, error: error.message };
  }
}

// Create user_skills table if it doesn't exist
async function createUserSkillsTable() {
  try {
    console.log('Creating user_skills table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        skill_id INTEGER NOT NULL REFERENCES skills(id),
        score DECIMAL NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        verified_at TIMESTAMP
      );
    `;

    console.log('User skills table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating user_skills table:', error);
    return { success: false, error: error.message };
  }
}

// Create challenges table if it doesn't exist
async function createChallengesTable() {
  try {
    console.log('Creating challenges table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        skill_id INTEGER NOT NULL REFERENCES skills(id),
        difficulty VARCHAR(20) NOT NULL,
        time_estimate INTEGER NOT NULL,
        is_automated BOOLEAN NOT NULL DEFAULT TRUE,
        content JSONB NOT NULL,
        scoring_criteria JSONB NOT NULL
      );
    `;

    console.log('Challenges table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating challenges table:', error);
    return { success: false, error: error.message };
  }
}

// Create user_challenges table if it doesn't exist
async function createUserChallengesTable() {
  try {
    console.log('Creating user_challenges table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        challenge_id INTEGER NOT NULL REFERENCES challenges(id),
        submission JSONB,
        score DECIMAL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `;

    console.log('User challenges table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating user_challenges table:', error);
    return { success: false, error: error.message };
  }
}

// Create companies table if it doesn't exist
async function createCompaniesTable() {
  try {
    console.log('Creating companies table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        name VARCHAR(100) NOT NULL,
        industry VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        website VARCHAR(255),
        culture_description TEXT,
        culture_metrics JSONB
      );
    `;

    console.log('Companies table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating companies table:', error);
    return { success: false, error: error.message };
  }
}

// Create opportunities table if it doesn't exist
async function createOpportunitiesTable() {
  try {
    console.log('Creating opportunities table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id),
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(100) NOT NULL,
        location_type VARCHAR(50) NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        salary_period VARCHAR(20) NOT NULL DEFAULT 'yearly',
        employment_type VARCHAR(50) NOT NULL,
        required_skills JSONB NOT NULL,
        work_sample JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    console.log('Opportunities table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating opportunities table:', error);
    return { success: false, error: error.message };
  }
}

// Create applications table if it doesn't exist
async function createApplicationsTable() {
  try {
    console.log('Creating applications table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
        match_score DECIMAL NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `;

    console.log('Applications table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating applications table:', error);
    return { success: false, error: error.message };
  }
}

// Create messages table if it doesn't exist
async function createMessagesTable() {
  try {
    console.log('Creating messages table if it doesn\'t exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    console.log('Messages table created or already exists.');
    return { success: true };
  } catch (error) {
    console.error('Error creating messages table:', error);
    return { success: false, error: error.message };
  }
}

// Insert sample skills
async function insertSampleSkills() {
  try {
    console.log('Checking if skills table is empty...');

    const skillCount = await sql`SELECT COUNT(*) FROM skills`;

    if (skillCount[0].count > 0) {
      console.log('Skills table already has data, skipping sample data insertion.');
      return { success: true, skipped: true };
    }

    console.log('Inserting sample skills...');

    const skillNames = [
      { name: "JavaScript", category: "Programming" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "TypeScript", category: "Programming" },
      { name: "Express", category: "Backend" },
      { name: "PostgreSQL", category: "Database" },
      { name: "UI/UX Design", category: "Design" },
      { name: "GraphQL", category: "API" },
      { name: "Redux", category: "Frontend" },
      { name: "AWS", category: "DevOps" },
      { name: "Python", category: "Programming" },
      { name: "SQL", category: "Database" },
      { name: "Java", category: "Programming" },
      { name: "C#", category: "Programming" },
      { name: "PHP", category: "Programming" },
      { name: "Docker", category: "DevOps" },
      { name: "Kubernetes", category: "DevOps" },
      { name: "Machine Learning", category: "Data Science" },
      { name: "Data Analysis", category: "Data Science" },
      { name: "Product Management", category: "Management" },
      { name: "Agile", category: "Methodology" },
      { name: "Scrum", category: "Methodology" },
      { name: "Technical Writing", category: "Communication" },
      { name: "Public Speaking", category: "Communication" },
      { name: "Leadership", category: "Soft Skills" }
    ];

    for (const skill of skillNames) {
      await sql`
        INSERT INTO skills (name, category)
        VALUES (${skill.name}, ${skill.category})
      `;
    }

    console.log('Sample skills inserted successfully.');
    return { success: true };
  } catch (error) {
    console.error('Error inserting sample skills:', error);
    return { success: false, error: error.message };
  }
}

// Run migrations
export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Create tables in order of dependencies
    const usersResult = await createUsersTable();
    if (!usersResult.success) {
      return { success: false, message: 'Failed to create users table', details: usersResult };
    }

    const skillsResult = await createSkillsTable();
    if (!skillsResult.success) {
      return { success: false, message: 'Failed to create skills table', details: skillsResult };
    }

    const userSkillsResult = await createUserSkillsTable();
    if (!userSkillsResult.success) {
      return { success: false, message: 'Failed to create user_skills table', details: userSkillsResult };
    }

    const challengesResult = await createChallengesTable();
    if (!challengesResult.success) {
      return { success: false, message: 'Failed to create challenges table', details: challengesResult };
    }

    const userChallengesResult = await createUserChallengesTable();
    if (!userChallengesResult.success) {
      return { success: false, message: 'Failed to create user_challenges table', details: userChallengesResult };
    }

    const companiesResult = await createCompaniesTable();
    if (!companiesResult.success) {
      return { success: false, message: 'Failed to create companies table', details: companiesResult };
    }

    const opportunitiesResult = await createOpportunitiesTable();
    if (!opportunitiesResult.success) {
      return { success: false, message: 'Failed to create opportunities table', details: opportunitiesResult };
    }

    const applicationsResult = await createApplicationsTable();
    if (!applicationsResult.success) {
      return { success: false, message: 'Failed to create applications table', details: applicationsResult };
    }

    const messagesResult = await createMessagesTable();
    if (!messagesResult.success) {
      return { success: false, message: 'Failed to create messages table', details: messagesResult };
    }

    // Insert sample data
    const sampleSkillsResult = await insertSampleSkills();
    if (!sampleSkillsResult.success && !sampleSkillsResult.skipped) {
      return { success: false, message: 'Failed to insert sample skills', details: sampleSkillsResult };
    }

    console.log('All migrations completed successfully!');

    return {
      success: true,
      message: 'Migrations completed successfully',
      details: {
        users: usersResult,
        skills: skillsResult,
        userSkills: userSkillsResult,
        challenges: challengesResult,
        userChallenges: userChallengesResult,
        companies: companiesResult,
        opportunities: opportunitiesResult,
        applications: applicationsResult,
        messages: messagesResult,
        sampleSkills: sampleSkillsResult
      }
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: 'Migrations failed',
      error: error.message
    };
  }
}

// Export for direct execution
export default async function migrate() {
  const result = await runMigrations();
  console.log('Migration result:', result);
  return result;
}
