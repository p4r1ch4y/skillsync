# SkillSync: The Anti-Resume Talent Platform

SkillSync is a revolutionary talent matching platform that focuses on verified skills rather than traditional resumes. By prioritizing demonstrated abilities over paper qualifications, we create a more meritocratic and efficient hiring process.

## 🎥 Demo
Introduction and Insights : 
https://youtu.be/wc6xWAcrBiU?

Demo Presentation :
https://youtu.be/ZTWV7lH92Wo

<iframe width="560" height="315" src="https://www.youtube.com/embed/wm9ZMgvbrlg?si=SHia4Bu1yP6ZuzTB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 📸 Screenshots

[Coming Soon] Screenshots showcasing the platform's key features and user interface will be added here.

## ✨ Key Features

### Skills-First Approach
- Skill verification through standardized challenges
- Performance-based matching algorithm
- Objective skill scoring system

### Bias Reduction
- Anonymous initial profiles
- Data-driven matching process
- Focus on verified capabilities

### Smart Matching Algorithm
- Advanced skill similarity computation
- Weighted skill matching
- Support for both verified and claimed skills

### Transparent Platform
- Clear role expectations
- Upfront salary information
- Real-world work samples

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- NEON DB as PostgreSQL database with Drizzle ORM

### Deployment
- Vercel for serverless hosting
- API routes with serverless functions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

## 📖 Documentation

### API Endpoints

#### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/logout` - User logout

#### Skills
- GET `/api/skills` - List all skills
- POST `/api/skills/verify` - Submit skill verification
- GET `/api/skills/matches` - Get skill matches

### Core Algorithms

SkillSync uses sophisticated matching algorithms:

1. **Match Score Computation**
```typescript
function computeMatchScore(
  userSkills: UserSkill[],
  requiredSkills: number[]
): number
```
- Calculates match percentage between user skills and job requirements
- Weights verified skills higher than claimed skills

2. **Skill Similarity**
```typescript
function computeSkillSimilarity(
  skillVector1: number[],
  skillVector2: number[]
): number
```
- Uses cosine similarity for advanced skill matching
- Enables nuanced comparison of skill sets

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

meet the team behind SkillSync : 

@p4r1ch4y System Design / backend and DB dev
@Seplestr Full Stack / Front End
@ArpanOP11 Full Stack / 

## 📞 Contact

[Coming Soon] Contact information and support channels will be added here.

---

Built with ❤️ by the SkillSync Team
