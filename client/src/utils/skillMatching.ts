import { computeSkillSimilarity } from "@shared/skillMatching";

/**
 * Calculates the Euclidean distance between two skill vectors
 * 
 * @param skillVector1 First skill vector
 * @param skillVector2 Second skill vector
 * @returns Distance value (lower means more similar)
 */
export function calculateEuclideanDistance(
  skillVector1: number[],
  skillVector2: number[]
): number {
  if (skillVector1.length !== skillVector2.length) {
    throw new Error("Skill vectors must have the same length");
  }
  
  let sum = 0;
  for (let i = 0; i < skillVector1.length; i++) {
    const diff = skillVector1[i] - skillVector2[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

/**
 * Normalizes a skill vector (scales values to sum to 1)
 * 
 * @param skillVector Skill vector to normalize
 * @returns Normalized skill vector
 */
export function normalizeSkillVector(skillVector: number[]): number[] {
  const sum = skillVector.reduce((acc, val) => acc + val, 0);
  
  if (sum === 0) {
    return skillVector; // Cannot normalize a zero vector
  }
  
  return skillVector.map(val => val / sum);
}

/**
 * Calculate weighted skill match score between candidate skills and job requirements
 * 
 * @param candidateSkills Map of skill IDs to scores (0-100)
 * @param requiredSkills Map of skill IDs to importance weights (0-1)
 * @returns Match percentage (0-100)
 */
export function calculateWeightedSkillMatch(
  candidateSkills: Map<number, number>,
  requiredSkills: Map<number, number>
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  // For each required skill
  for (const [skillId, weight] of requiredSkills.entries()) {
    totalWeight += weight;
    
    // If candidate has the skill
    if (candidateSkills.has(skillId)) {
      const candidateScore = candidateSkills.get(skillId)! / 100; // Normalize to 0-1
      totalScore += candidateScore * weight;
    }
  }
  
  // Convert to percentage
  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
}

/**
 * Recommends top matching skills for a candidate to develop based on job market demand
 * 
 * @param candidateSkills Map of skill IDs to scores
 * @param marketDemand Map of skill IDs to demand score (higher = more in demand)
 * @param maxRecommendations Maximum number of recommendations to return
 * @returns Array of recommended skill IDs
 */
export function recommendSkillsToImprove(
  candidateSkills: Map<number, number>,
  marketDemand: Map<number, number>,
  maxRecommendations: number = 3
): number[] {
  const recommendations: [number, number][] = []; // [skillId, score]
  
  // For each skill in market demand
  for (const [skillId, demandScore] of marketDemand.entries()) {
    const candidateScore = candidateSkills.get(skillId) || 0;
    
    // If candidate doesn't have skill or score is low
    if (candidateScore < 70) {
      // Calculate potential improvement value (demand * improvement gap)
      const improvementValue = demandScore * ((100 - candidateScore) / 100);
      recommendations.push([skillId, improvementValue]);
    }
  }
  
  // Sort by improvement value (descending) and take top N
  return recommendations
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxRecommendations)
    .map(([skillId]) => skillId);
}

/**
 * Creates an embedding for a job opportunity based on required skills
 * 
 * @param requiredSkills Array of required skill IDs
 * @param allSkillIds Array of all possible skill IDs
 * @returns Opportunity embedding vector
 */
export function createOpportunityEmbedding(
  requiredSkills: number[],
  allSkillIds: number[]
): number[] {
  return allSkillIds.map(skillId => {
    return requiredSkills.includes(skillId) ? 1 : 0;
  });
}

/**
 * Uses cosine similarity from shared module to find similarity between profiles
 * 
 * @param vectorA First vector
 * @param vectorB Second vector
 * @returns Similarity score (0-1)
 */
export function findProfileSimilarity(
  vectorA: number[],
  vectorB: number[]
): number {
  return computeSkillSimilarity(vectorA, vectorB);
}
