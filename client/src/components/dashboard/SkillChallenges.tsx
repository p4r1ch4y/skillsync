import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ChallengeCard from "../challenges/ChallengeCard";

interface Challenge {
  id: number;
  title: string;
  description: string;
  skillId: number;
  difficulty: string;
  timeEstimate: number;
  isAutomated: boolean;
  skill: {
    id: number;
    name: string;
    category: string;
  };
}

interface UserSkillWithDetails {
  id: number;
  userId: number;
  skillId: number;
  score: number;
  isVerified: boolean;
  verifiedAt: string | null;
  skill: {
    id: number;
    name: string;
    category: string;
  };
}

const SkillChallenges = () => {
  const { data: challenges, isLoading: loadingChallenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: userSkills, isLoading: loadingUserSkills } = useQuery<UserSkillWithDetails[]>({
    queryKey: ["/api/user-skills"],
  });

  // Get the skill IDs that the user has but aren't verified or have low scores
  const skillsToImprove = userSkills
    ?.filter(skill => !skill.isVerified || Number(skill.score) < 70)
    .map(skill => skill.skillId) || [];

  // Filter challenges to recommend
  const recommendedChallenges = challenges
    ?.filter(challenge => skillsToImprove.includes(challenge.skillId))
    .slice(0, 3);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-gray-900">Recommended Challenges</h2>
        <Link href="/challenges">
          <a className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View all challenges
          </a>
        </Link>
      </div>
      
      {loadingChallenges || loadingUserSkills ? (
        <div className="text-sm text-gray-500">Loading challenges...</div>
      ) : recommendedChallenges?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
          No recommended challenges at the moment. Check back later or explore all challenges.
        </div>
      )}
    </div>
  );
};

export default SkillChallenges;
