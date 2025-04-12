import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, Briefcase, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

interface Application {
  id: number;
  matchScore: number;
  opportunity: {
    id: number;
    title: string;
  };
}

const DashboardOverview = ({ userName }: { userName: string }) => {
  const { data: userSkills, isLoading: loadingSkills } = useQuery<UserSkillWithDetails[]>({
    queryKey: ["/api/user-skills"],
  });

  const { data: applications, isLoading: loadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Calculate skill stats
  const verifiedSkillsCount = userSkills?.filter(skill => skill.isVerified).length || 0;
  
  // Calculate match stats
  const newMatchesCount = applications?.filter(app => app.matchScore >= 80).length || 0;
  
  // Calculate skill score (average of verified skills)
  const skillScore = userSkills && userSkills.length > 0
    ? Math.round(
        userSkills
          .filter(skill => skill.isVerified)
          .reduce((acc, skill) => acc + Number(skill.score), 0) / 
          (verifiedSkillsCount || 1)
      )
    : 0;
  
  // Calculate percentage for progress bar (assuming average skill score is usually around 70)
  const skillScorePercentage = Math.min(Math.round((skillScore / 70) * 100), 100);

  return (
    <div className="mb-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {userName}</h1>
      <p className="text-gray-600 mb-6">Keep building your skill profile to get matched with great opportunities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Verified Skills</p>
                <p className="text-2xl font-semibold mt-1">{verifiedSkillsCount}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-md">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/challenges">
                <a className="text-blue-600 text-sm font-medium hover:text-blue-700">Complete challenges →</a>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">New Matches</p>
                <p className="text-2xl font-semibold mt-1">{newMatchesCount}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-md">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/opportunities">
                <a className="text-blue-600 text-sm font-medium hover:text-blue-700">View opportunities →</a>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Skill Score</p>
                <p className="text-2xl font-semibold mt-1">{skillScore}</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-md">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={skillScorePercentage} className="h-2.5 bg-gray-200" />
              <p className="text-gray-500 text-xs mt-1">
                {skillScorePercentage > 50 
                  ? `${skillScorePercentage - 50}% higher than average` 
                  : `${50 - skillScorePercentage}% lower than average`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
