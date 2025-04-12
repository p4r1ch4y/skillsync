import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import OpportunityCard from "../opportunities/OpportunityCard";

interface Opportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  locationType: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  employmentType: string;
  requiredSkills: number[];
  company: {
    id: number;
    name: string;
  };
  matchScore: number;
}

const OpportunityMatches = () => {
  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  // Filter for best matches (score >= 80%)
  const bestMatches = opportunities
    ?.filter(opportunity => opportunity.matchScore >= 80)
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-gray-900">Your Opportunity Matches</h2>
        <Link href="/opportunities">
          <a className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View all matches
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading opportunities...</div>
      ) : bestMatches?.length ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {bestMatches.map((opportunity, index) => (
            <div 
              key={opportunity.id} 
              className={`p-6 ${index !== bestMatches.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <OpportunityCard opportunity={opportunity} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
          No matching opportunities found. Complete more skill challenges to improve your matches.
        </div>
      )}
    </div>
  );
};

export default OpportunityMatches;
