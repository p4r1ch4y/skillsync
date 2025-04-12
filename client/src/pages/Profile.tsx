import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import TabNavigation from "@/components/layout/TabNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, PencilIcon, Briefcase, GraduationCap, MapPin, BarChart2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SkillBadge from "@/components/skills/SkillBadge";
import { Skeleton } from "@/components/ui/skeleton";

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
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
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

const Profile = () => {
  const [_, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    bio: "",
    education: "",
    experience: "",
    location: "",
  });
  const { toast } = useToast();

  const { data: user, isLoading: loadingUser, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: userSkills, isLoading: loadingSkills } = useQuery<UserSkillWithDetails[]>({
    queryKey: ["/api/user-skills"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("PUT", `/api/users/${user.id}`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
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

  // Group skills by category for display
  const skillsByCategory: Record<string, UserSkillWithDetails[]> = {};
  userSkills?.forEach(userSkill => {
    const category = userSkill.skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(userSkill);
  });

  useEffect(() => {
    // If error is 401 (unauthorized), redirect to login
    if (error) {
      if ((error as any).status === 401) {
        navigate("/login");
      }
    }
  }, [error, navigate]);

  useEffect(() => {
    // Initialize form when user data is loaded
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        title: user.title || "",
        bio: user.bio || "",
        education: user.education || "",
        experience: user.experience || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = () => {
    updateProfileMutation.mutate({
      ...profileForm,
      profileCompleted: true
    });
  };

  // Calculate skill metrics
  const getSkillStats = () => {
    if (!userSkills || userSkills.length === 0) return { total: 0, verified: 0, avgScore: 0 };
    
    const verifiedSkills = userSkills.filter(skill => skill.isVerified);
    const avgScore = verifiedSkills.length > 0 
      ? Math.round(verifiedSkills.reduce((sum, skill) => sum + Number(skill.score), 0) / verifiedSkills.length)
      : 0;
    
    return {
      total: userSkills.length,
      verified: verifiedSkills.length,
      avgScore
    };
  };

  const skillStats = getSkillStats();

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-lg mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <TabNavigation candidateUrl="/dashboard" companyUrl="/company" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-md mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-lg bg-primary-100 text-primary-700">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-center">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.title ? (
                    <p className="text-gray-600 text-center mt-1">{user.title}</p>
                  ) : (
                    <p className="text-gray-400 text-center text-sm mt-1 italic">Add a professional title</p>
                  )}
                  
                  <div className="w-full mt-6">
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                      <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm text-gray-600">{user.experience || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Education</p>
                      <p className="text-sm text-gray-600">{user.education || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{user.location || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Skill Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Skills</span>
                        <span>{skillStats.total}</span>
                      </div>
                      <Progress value={(skillStats.total / 10) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Verified Skills</span>
                        <span>{skillStats.verified}/{skillStats.total}</span>
                      </div>
                      <Progress 
                        value={skillStats.total > 0 ? (skillStats.verified / skillStats.total) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Skill Score</span>
                        <span>{skillStats.avgScore}</span>
                      </div>
                      <Progress value={(skillStats.avgScore / 100) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {isEditing ? (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => handleProfileFormChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => handleProfileFormChange("lastName", e.target.value)}
                      />
                    </div>
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
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      placeholder="e.g. 5+ years in software development"
                      value={profileForm.experience}
                      onChange={(e) => handleProfileFormChange("experience", e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileSubmit}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <>
                <Card className="shadow-md mb-6">
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.bio ? (
                      <p className="text-gray-700">{user.bio}</p>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md text-center">
                        <p className="text-gray-500">You haven't added a bio yet.</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-primary-600"
                          onClick={() => setIsEditing(true)}
                        >
                          Add your bio now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Skills</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                        Add Skills
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSkills ? (
                      <div className="text-center py-4">
                        <Skeleton className="h-8 w-32 mx-auto mb-4" />
                        <Skeleton className="h-6 w-full max-w-md mx-auto" />
                      </div>
                    ) : Object.keys(skillsByCategory).length === 0 ? (
                      <div className="bg-gray-50 p-4 rounded-md text-center">
                        <p className="text-gray-500">You haven't added any skills yet.</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-primary-600"
                          onClick={() => navigate("/dashboard")}
                        >
                          Add skills to your profile
                        </Button>
                      </div>
                    ) : (
                      <Tabs defaultValue={Object.keys(skillsByCategory)[0]}>
                        <TabsList className="mb-4">
                          {Object.keys(skillsByCategory).map(category => (
                            <TabsTrigger key={category} value={category}>
                              {category}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {Object.entries(skillsByCategory).map(([category, skills]) => (
                          <TabsContent key={category} value={category}>
                            <div className="space-y-4">
                              {skills.map(userSkill => (
                                <div key={userSkill.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                                  <div>
                                    <div className="flex items-center">
                                      <h4 className="text-md font-medium text-gray-800">{userSkill.skill.name}</h4>
                                      {userSkill.isVerified && (
                                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                    {userSkill.isVerified ? (
                                      <div className="mt-2">
                                        <div className="flex items-center">
                                          <span className="text-sm text-gray-500 mr-2">Skill Score:</span>
                                          <BarChart2 className="h-4 w-4 text-gray-400 mr-1" />
                                          <span className="text-sm font-medium">{userSkill.score}/100</span>
                                        </div>
                                        <Progress value={Number(userSkill.score)} className="h-1.5 mt-1.5" />
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Take challenges to verify this skill
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    {!userSkill.isVerified && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => navigate("/challenges")}
                                      >
                                        Verify
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;