// Skill matching utility

/**
 * Computes the match score between a candidate's verified skills and a job opportunity's
 * required skills. Returns a number between 0 and 100.
 *
 * @param userSkills Array of user skills with score and verification status
 * @param requiredSkills Array of required skill IDs from an opportunity
 * @returns A match score between 0 and 100
 */
export function computeMatchScore(userSkills, requiredSkills) {
  if (!userSkills || !requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return 0;
  }

  let totalMatchScore = 0;
  const skillWeight = 100 / requiredSkills.length;

  for (const requiredSkillId of requiredSkills) {
    // Find this skill in the user's skill set
    const userSkill = userSkills.find(skill => skill.skillId === requiredSkillId);

    if (userSkill) {
      // If the skill is verified, use the score
      if (userSkill.isVerified) {
        totalMatchScore += (userSkill.score * skillWeight) / 100;
      }
      // If the skill is claimed but not verified, give partial credit
      else {
        totalMatchScore += skillWeight * 0.2; // 20% credit for unverified skills
      }
    }
  }

  // Round to 2 decimal places
  return Math.round(totalMatchScore);
}

/**
 * Computes skill similarity based on cosine similarity between skill vectors.
 * Used for more advanced matching and recommendation systems.
 *
 * @param skillVector1 First skill vector (array of numbers)
 * @param skillVector2 Second skill vector (array of numbers)
 * @returns A similarity score between 0 and 1
 */
export function computeSkillSimilarity(skillVector1, skillVector2) {
  if (skillVector1.length !== skillVector2.length) {
    throw new Error("Skill vectors must have the same length");
  }

  // Compute dot product
  let dotProduct = 0;
  for (let i = 0; i < skillVector1.length; i++) {
    dotProduct += skillVector1[i] * skillVector2[i];
  }

  // Compute magnitudes
  let magnitude1 = 0;
  for (const value of skillVector1) {
    magnitude1 += value * value;
  }
  magnitude1 = Math.sqrt(magnitude1);

  let magnitude2 = 0;
  for (const value of skillVector2) {
    magnitude2 += value * value;
  }
  magnitude2 = Math.sqrt(magnitude2);

  // Handle zero magnitude case
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Compute cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Creates a skill vector for a candidate based on their verified skills.
 *
 * @param userSkills Array of user skills
 * @param allSkillIds Array of all possible skill IDs in the system
 * @returns A skill vector (array of numbers)
 */
export function createSkillVector(userSkills, allSkillIds) {
  return allSkillIds.map(skillId => {
    const userSkill = userSkills.find(skill => skill.skillId === skillId);

    if (userSkill && userSkill.isVerified) {
      return userSkill.score / 100; // Normalize to 0-1 range
    }

    return 0;
  });
}
