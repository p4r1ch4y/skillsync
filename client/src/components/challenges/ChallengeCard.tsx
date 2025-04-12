import { Clock, Star, CheckCircle, Code } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  // Function to get skill icon based on category
  const getSkillIcon = (category: string) => {
    switch (category) {
      case "Programming":
      case "Frontend":
      case "Backend":
        return <Code className="h-5 w-5 text-green-600" />;
      case "Design":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return <Code className="h-5 w-5 text-green-600" />;
    }
  };

  // Function to get difficulty stars
  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="ml-1 text-xs text-gray-500">Beginner</span>
          </div>
        );
      case "intermediate":
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="ml-1 text-xs text-gray-500">Intermediate</span>
          </div>
        );
      case "advanced":
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="ml-1 text-xs text-gray-500">Advanced</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="ml-1 text-xs text-gray-500">{difficulty}</span>
          </div>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
              {challenge.skill.name}
            </Badge>
            <h3 className="mt-2 text-base font-medium text-gray-900">{challenge.title}</h3>
          </div>
          <div className="bg-green-100 rounded-full p-1.5">
            {getSkillIcon(challenge.skill.category)}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
        <div className="mt-4 flex items-center flex-wrap gap-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="ml-1 text-xs text-gray-500">~{challenge.timeEstimate} mins</span>
          </div>
          {getDifficultyStars(challenge.difficulty)}
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            <span className="ml-1 text-xs text-gray-500">
              {challenge.isAutomated ? "Auto-scored" : "Peer-reviewed"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <Link href={`/challenges/${challenge.id}`}>
          <a className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Start challenge →
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
