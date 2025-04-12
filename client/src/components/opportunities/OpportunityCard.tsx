import { Link } from "wouter";
import { Building, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface OpportunityCardProps {
  opportunity: Opportunity;
  skills?: Array<{ id: number; name: string }>;
}

const OpportunityCard = ({ opportunity, skills }: OpportunityCardProps) => {
  // Format salary
  const formatSalary = (min: number, max: number, period: string) => {
    const formatNumber = (num: number) => 
      num >= 1000 ? `$${(num / 1000).toFixed(0)}K` : `$${num}`;
    
    const periodText = period === "yearly" 
      ? "Annual" 
      : period === "monthly" 
        ? "Monthly" 
        : "Hourly";
    
    return {
      range: `${formatNumber(min)} - ${formatNumber(max)}`,
      periodText: `${periodText}, ${opportunity.employmentType}`
    };
  };

  const { range, periodText } = formatSalary(
    opportunity.salaryMin,
    opportunity.salaryMax,
    opportunity.salaryPeriod
  );

  // Format match score
  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <h3 className="text-base font-medium text-gray-900">{opportunity.title}</h3>
          {opportunity.matchScore > 0 && (
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchBadgeColor(opportunity.matchScore)}`}>
              {opportunity.matchScore}% Match
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-3 flex-wrap gap-y-1">
          <div className="flex items-center">
            <Building className="flex-shrink-0 h-4 w-4 text-gray-400" />
            <span className="ml-1">{opportunity.company.name}</span>
          </div>
          <div className="flex items-center ml-4">
            <MapPin className="flex-shrink-0 h-4 w-4 text-gray-400" />
            <span className="ml-1">
              {opportunity.location} 
              {opportunity.locationType === "remote" && " (Remote)"}
              {opportunity.locationType === "hybrid" && " (Hybrid)"}
              {opportunity.locationType === "onsite" && " (Onsite)"}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{opportunity.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {/* If skills are provided, show them by name */}
          {skills && opportunity.requiredSkills.map(skillId => {
            const skill = skills.find(s => s.id === skillId);
            return skill ? (
              <Badge key={skillId} variant="outline" className="bg-blue-100 text-blue-800 border-none">
                {skill.name}
              </Badge>
            ) : null;
          })}
          
          {/* If skills are not provided, just show the skill IDs as placeholders */}
          {!skills && opportunity.requiredSkills.map(skillId => (
            <Badge key={skillId} variant="outline" className="bg-blue-100 text-blue-800 border-none">
              Skill {skillId}
            </Badge>
          ))}
        </div>
      </div>
      <div className="sm:ml-6 flex flex-col justify-between mt-4 sm:mt-0">
        <div className="bg-green-50 rounded-md px-4 py-3 text-center mb-4 sm:mb-0">
          <p className="text-sm font-medium text-green-800">Salary Range</p>
          <p className="text-lg font-semibold text-green-900">{range}</p>
          <p className="text-xs text-green-600">{periodText}</p>
        </div>
        <div className="flex justify-end">
          <Link href={`/opportunities/${opportunity.id}`}>
            <Button className="text-sm">
              View Work Sample
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
