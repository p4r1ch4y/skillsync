import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SkillBadge from "../skills/SkillBadge";

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

interface Skill {
  id: number;
  name: string;
  category: string;
}

const SkillProfile = () => {
  const [isAddingSkills, setIsAddingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: userSkills, isLoading: loadingUserSkills } = useQuery<UserSkillWithDetails[]>({
    queryKey: ["/api/user-skills"],
  });

  const { data: allSkills, isLoading: loadingSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const userData = await queryClient.fetchQuery({ queryKey: ["/api/auth/me"] });
      return apiRequest("POST", "/api/user-skills", {
        userId: userData.id,
        skillId,
        score: "0", // Send as string to match database decimal type
        isVerified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-skills"] });
      setIsAddingSkills(false);
      setSelectedSkills([]);
      toast({
        title: "Skills added",
        description: "Skills have been added to your profile. Complete challenges to verify them.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skills. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSkills = async () => {
    for (const skillId of selectedSkills) {
      await addSkillMutation.mutateAsync(skillId);
    }
  };

  // Separate verified and unverified skills
  const verifiedSkills = userSkills?.filter(skill => skill.isVerified) || [];
  const unverifiedSkills = userSkills?.filter(skill => !skill.isVerified) || [];

  // Filter out skills that the user already has
  const availableSkills = allSkills?.filter(
    skill => !userSkills?.some(us => us.skillId === skill.id)
  ) || [];

  return (
    <Card className="bg-white rounded-lg shadow mb-8">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Your Skill Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          These verified skills are used to match you with relevant opportunities.
        </p>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex flex-wrap gap-3 mb-6">
          {loadingUserSkills ? (
            <div className="text-sm text-gray-500">Loading skills...</div>
          ) : (
            <>
              {verifiedSkills.map(userSkill => (
                <SkillBadge
                  key={userSkill.id}
                  name={userSkill.skill.name}
                  score={Number(userSkill.score)}
                  isVerified={true}
                />
              ))}
              
              {unverifiedSkills.map(userSkill => (
                <Badge
                  key={userSkill.id}
                  variant="outline"
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {userSkill.skill.name}
                </Badge>
              ))}
            </>
          )}
        </div>
        
        <div className="flex items-center">
          <Dialog open={isAddingSkills} onOpenChange={setIsAddingSkills}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-sm">
                <Plus className="h-5 w-5 mr-2" />
                Add Skills
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Skills to Your Profile</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-500 mb-4">
                  Select the skills you'd like to add to your profile. You'll need to complete challenges to verify them.
                </p>
                <div className="max-h-60 overflow-y-auto">
                  {loadingSkills ? (
                    <div className="text-sm text-gray-500">Loading available skills...</div>
                  ) : availableSkills.length === 0 ? (
                    <div className="text-sm text-gray-500">You've already added all available skills!</div>
                  ) : (
                    <div className="space-y-2">
                      {availableSkills.map(skill => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill.id}`}
                            checked={selectedSkills.includes(skill.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSkills([...selectedSkills, skill.id]);
                              } else {
                                setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                              }
                            }}
                          />
                          <Label htmlFor={`skill-${skill.id}`}>
                            {skill.name}
                            <span className="ml-2 text-xs text-gray-500">({skill.category})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddSkills}
                  disabled={selectedSkills.length === 0 || addSkillMutation.isPending}
                >
                  {addSkillMutation.isPending ? "Adding..." : "Add Selected Skills"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="ml-3 text-sm text-gray-500">
            <span>Verify more skills to improve your match score.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillProfile;
