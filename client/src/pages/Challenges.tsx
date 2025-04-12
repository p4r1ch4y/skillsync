import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

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

interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  submission: any;
  score: number | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  challenge: Challenge;
  skill: {
    id: number;
    name: string;
    category: string;
  };
}

interface User {
  id: number;
  type: string;
}

const Challenges = () => {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  
  const { data: user, isLoading: loadingUser, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: challenges, isLoading: loadingChallenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });
  
  const { data: userSkills, isLoading: loadingUserSkills } = useQuery<UserSkillWithDetails[]>({
    queryKey: ["/api/user-skills"],
    enabled: !!user,
  });
  
  const { data: userChallenges, isLoading: loadingUserChallenges } = useQuery<UserChallenge[]>({
    queryKey: ["/api/user-challenges"],
    enabled: !!user,
  });
  
  useEffect(() => {
    // If error is 401 (unauthorized), redirect to login
    if (userError) {
      if ((userError as any).status === 401) {
        navigate("/login");
      }
    }
    
    // If user is company type, redirect to dashboard
    if (user && user.type === "company") {
      navigate("/company");
    }
  }, [user, userError, navigate]);
  
  // Get unique categories from challenges
  const categories = challenges 
    ? [...new Set(challenges.map(challenge => challenge.skill.category))]
    : [];
  
  // Filter challenges based on search and filters
  const filteredChallenges = challenges
    ? challenges.filter(challenge => {
        const matchesSearch = 
          searchQuery === "" || 
          challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challenge.skill.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDifficulty = 
          difficultyFilter === "" || challenge.difficulty === difficultyFilter;
        
        const matchesCategory = 
          categoryFilter === "" || challenge.skill.category === categoryFilter;
        
        return matchesSearch && matchesDifficulty && matchesCategory;
      })
    : [];
  
  // Get recommended challenges (for skills that are not verified or have low scores)
  const skillsToImprove = userSkills
    ?.filter(skill => !skill.isVerified || Number(skill.score) < 70)
    .map(skill => skill.skillId) || [];
  
  const recommendedChallenges = filteredChallenges
    .filter(challenge => skillsToImprove.includes(challenge.skillId))
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 6); // Get up to 6 challenges
  
  // Get challenges in progress
  const challengesInProgress = userChallenges
    ?.filter(uc => uc.status === "pending")
    .map(uc => uc.challenge) || [];
  
  // Get completed challenges
  const completedChallenges = userChallenges
    ?.filter(uc => uc.status === "completed")
    .map(uc => ({
      ...uc.challenge,
      userScore: uc.score
    })) || [];
  
  const isLoading = loadingUser || loadingChallenges || loadingUserSkills || loadingUserChallenges;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Skeleton className="h-10 w-full md:w-1/3" />
              <Skeleton className="h-10 w-full md:w-1/6" />
              <Skeleton className="h-10 w-full md:w-1/6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Skill Challenges</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search for challenges, skills, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="recommended" className="mb-8">
          <TabsList>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="mt-6">
            {recommendedChallenges.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  No recommended challenges found. Try refining your filters or check out all available challenges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            {filteredChallenges.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  No challenges match your search or filters. Try different criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            {challengesInProgress.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  You don't have any challenges in progress. Start a new challenge to build your skills!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {challengesInProgress.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedChallenges.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  You haven't completed any challenges yet. Complete challenges to verify your skills!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                            {challenge.skill.name}
                          </Badge>
                          <h3 className="mt-2 text-base font-medium text-gray-900">{challenge.title}</h3>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-none">
                          {challenge.userScore}%
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
                    </div>
                    <div className="px-5 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                      <span className="text-green-600 text-sm font-medium">Completed ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Challenges;
