import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Award, Book, AlertCircle, User } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  bio?: string;
  title?: string;
  education?: string;
  experience?: string;
  location?: string;
  profileCompleted?: boolean;
}

interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  score: number;
  isVerified: boolean;
}

const ProfileCompletion = () => {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    title: "",
    bio: "",
    education: "",
    experience: "",
    location: "",
  });
  const { toast } = useToast();

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: userSkills, isLoading: loadingSkills } = useQuery<UserSkill[]>({
    queryKey: ["/api/user-skills"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("PUT", `/api/users/${user.id}`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsProfileDialogOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    if (!user) return 0;
    
    let completedItems = 0;
    let totalItems = 5; // basic profile fields + skills
    
    if (user.firstName && user.lastName) completedItems++;
    if (user.title) completedItems++;
    if (user.bio) completedItems++;
    if (user.education) completedItems++;
    if (user.location) completedItems++;
    
    // Add skill completion (at least 3 skills added)
    if (userSkills && userSkills.length >= 3) {
      completedItems++;
    } else {
      totalItems++;
    }
    
    // Add verified skills (at least 1 verified skill)
    if (userSkills && userSkills.some(skill => skill.isVerified)) {
      completedItems++;
    } else {
      totalItems++;
    }
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const profileCompletionPercentage = calculateProfileCompletion();
  
  // Check if the profile is new/incomplete (less than 50% complete)
  const isProfileIncomplete = profileCompletionPercentage < 50;

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = () => {
    updateProfileMutation.mutate({
      ...profileForm,
      profileCompleted: true
    });
  };

  // Initialize the form with existing user data when opened
  const openProfileDialog = () => {
    if (user) {
      setProfileForm({
        title: user.title || "",
        bio: user.bio || "",
        education: user.education || "",
        experience: user.experience || "",
        location: user.location || "",
      });
    }
    setIsProfileDialogOpen(true);
  };

  if (loadingUser || !user) return null;
  
  // Only show this component for incomplete profiles
  if (!isProfileIncomplete && user.profileCompleted) return null;

  return (
    <Card className="bg-blue-50 border-blue-100 shadow-sm mb-8">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            <AlertCircle className="h-6 w-6 text-blue-700" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complete your profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your profile is {profileCompletionPercentage}% complete. Add more information to improve your matching score and visibility to employers.
            </p>
            
            <Progress value={profileCompletionPercentage} className="h-2 mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className={user.title ? "text-gray-700" : "text-gray-400"}>
                  {user.title ? "Professional title added" : "Add your professional title"}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Book className="h-4 w-4 text-gray-500" />
                <span className={user.education ? "text-gray-700" : "text-gray-400"}>
                  {user.education ? "Education details added" : "Add your education"}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Award className="h-4 w-4 text-gray-500" />
                <span className={userSkills && userSkills.some(skill => skill.isVerified) ? "text-gray-700" : "text-gray-400"}>
                  {userSkills && userSkills.some(skill => skill.isVerified) 
                    ? "You have verified skills" 
                    : "Verify your skills with challenges"}
                </span>
              </div>
            </div>
            
            <Button onClick={openProfileDialog}>
              Complete Your Profile
            </Button>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center mb-2">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500">Profile photos coming soon</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                placeholder="e.g. Frontend Developer, UX Designer"
                value={profileForm.title}
                onChange={(e) => handleProfileFormChange("title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your skills and experience"
                className="min-h-[100px]"
                value={profileForm.bio}
                onChange={(e) => handleProfileFormChange("bio", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="e.g. BS Computer Science, Stanford"
                  value={profileForm.education}
                  onChange={(e) => handleProfileFormChange("education", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA"
                  value={profileForm.location}
                  onChange={(e) => handleProfileFormChange("location", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Select 
                value={profileForm.experience} 
                onValueChange={(value) => handleProfileFormChange("experience", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleProfileSubmit}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProfileCompletion;