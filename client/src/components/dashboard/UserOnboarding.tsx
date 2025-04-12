import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, ArrowRight, Award } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  onboardingCompleted?: boolean;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

const UserOnboarding = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const { toast } = useToast();

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: skills, isLoading: loadingSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const addSkillsMutation = useMutation({
    mutationFn: async (skillId: number) => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("POST", "/api/user-skills", {
        userId: user.id,
        skillId,
        score: "0", // Send as string to match database decimal type
        isVerified: false,
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("PUT", `/api/users/${user.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Onboarding Completed",
        description: "Your preferences have been saved. Now let's build your skill profile!",
      });
      setIsOnboardingOpen(false);
    }
  });

  useEffect(() => {
    // Show onboarding dialog for new users who haven't completed onboarding
    if (user && !user.onboardingCompleted && !isOnboardingOpen) {
      setIsOnboardingOpen(true);
    }
  }, [user, isOnboardingOpen]);

  // Group skills by category for better display
  const skillsByCategory: Record<string, Skill[]> = {};
  skills?.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  const handleSkillToggle = (skillId: number) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!selectedSkills.length || !experienceLevel) {
      toast({
        title: "Missing Information",
        description: "Please select your skills and experience level.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add selected skills in parallel
      await Promise.all(
        selectedSkills.map(skillId => addSkillsMutation.mutateAsync(skillId))
      );
      
      // Update user preferences and complete onboarding
      await updateUserMutation.mutateAsync({
        onboardingCompleted: true,
        experience: experienceLevel,
        interests: selectedInterests,
      });

      // Update UI state
      setIsOnboardingOpen(false);
      
      // Show success message
      toast({
        title: "Success",
        description: "Your preferences have been saved. Welcome to your dashboard!",
      });

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Skills step
        return selectedSkills.length > 0;
      case 1: // Experience step
        return !!experienceLevel;
      case 2: // Interests step
        return selectedInterests.length > 0;
      default:
        return false;
    }
  };

  if (loadingUser || !user || user.onboardingCompleted) return null;

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Welcome to SkillSync, {user.firstName}!</DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Your progress</span>
            <span className="text-sm font-medium">{Math.round(((currentStep + 1) / 3) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / 3) * 100} className="h-2" />
        </div>

        <div className="py-2">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select your skills</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select the skills you have experience with. You'll be able to verify these skills later with challenges.
              </p>

              <Tabs defaultValue={Object.keys(skillsByCategory)[0] || "Programming"}>
                <TabsList className="mb-2 flex flex-wrap">
                  {Object.keys(skillsByCategory).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <TabsContent key={category} value={category} className="mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      {categorySkills.map(skill => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`skill-${skill.id}`} 
                            checked={selectedSkills.includes(skill.id)}
                            onCheckedChange={() => handleSkillToggle(skill.id)}
                          />
                          <Label htmlFor={`skill-${skill.id}`} className="text-sm">
                            {skill.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">What's your experience level?</h3>
              <p className="text-sm text-gray-500 mb-4">
                This helps us recommend appropriate challenges and opportunities for your skill level.
              </p>

              <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entry" id="experience-entry" />
                    <Label htmlFor="experience-entry">
                      <span className="font-medium">Entry Level</span>
                      <p className="text-sm text-gray-500">New to the field, 0-2 years of experience</p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mid" id="experience-mid" />
                    <Label htmlFor="experience-mid">
                      <span className="font-medium">Mid Level</span>
                      <p className="text-sm text-gray-500">Solid experience, 2-5 years of practical work</p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="senior" id="experience-senior" />
                    <Label htmlFor="experience-senior">
                      <span className="font-medium">Senior Level</span>
                      <p className="text-sm text-gray-500">Expert in your field, 5+ years of experience</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">What are you interested in?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select areas you'd like to find opportunities in. This helps us match you with the right companies.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Remote Work", "Startups", "Enterprise", "Tech", "Healthcare", 
                  "Finance", "Education", "E-commerce", "Social Impact", "AI & ML",
                  "Blockchain", "Mobile Development", "DevOps", "Data Science", "Design"
                ].map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`interest-${interest}`} 
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={`interest-${interest}`} className="text-sm">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid() || addSkillsMutation.isPending || updateUserMutation.isPending}
            className="w-full sm:w-auto"
          >
            {currentStep < 2 ? (
              <>
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : updateUserMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserOnboarding;