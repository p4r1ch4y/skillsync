import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  name: string;
  score: number;
  isVerified: boolean;
  className?: string;
}

const SkillBadge = ({ name, score, isVerified, className }: SkillBadgeProps) => {
  return (
    <div
      className={cn(
        "relative bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center",
        isVerified ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800",
        className
      )}
    >
      {isVerified && (
        <CheckCircle className="h-4 w-4 mr-1 text-blue-600" />
      )}
      {name}
      {isVerified && score > 0 && (
        <span className="ml-1 text-xs text-blue-600 font-semibold">{score}%</span>
      )}
      {isVerified && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      )}
    </div>
  );
};

export default SkillBadge;
