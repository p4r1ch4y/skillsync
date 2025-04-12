import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import TabNavigation from "@/components/layout/TabNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Users, Briefcase, Plus, User, LineChart } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
}

interface Company {
  id: number;
  userId: number;
  name: string;
  industry: string;
  location: string;
  website: string;
  cultureDescription: string;
  cultureMetrics: {
    workLifeBalance: number;
    learning: number;
    teamwork: number;
    autonomy: number;
  };
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Opportunity {
  id: number;
  companyId: number;
  title: string;
  description: string;
  location: string;
  locationType: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  employmentType: string;
  requiredSkills: number[];
  workSample: {
    description: string;
    tasks: string[];
    deliverables: string[];
  };
  status: string;
  createdAt: string;
}

interface Application {
  id: number;
  opportunityId: number;
  matchScore: number;
  status: string;
  appliedAt: string;
  updatedAt: string;
  opportunity: Opportunity;
  candidate: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

const CompanyDashboard = () => {
  const [_, navigate] = useLocation();
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    cultureDescription: "",
  });
  const [isCompanySetupOpen, setIsCompanySetupOpen] = useState(false);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: "",
    description: "",
    location: "",
    locationType: "remote",
    salaryMin: 50000,
    salaryMax: 100000,
    salaryPeriod: "yearly",
    employmentType: "full-time",
    requiredSkills: [] as number[],
    workSampleDescription: "",
    workSampleTasks: "",
    workSampleDeliverables: "",
  });
  const { toast } = useToast();

  const { data: user, isLoading: loadingUser, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: company, isLoading: loadingCompany } = useQuery<Company>({
    queryKey: ["/api/companies/user"],
    enabled: !!user,
  });

  const { data: opportunities, isLoading: loadingOpportunities } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities/company"],
    enabled: !!company,
  });

  const { data: applications, isLoading: loadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const { data: skills, isLoading: loadingSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("POST", "/api/companies", {
        userId: user.id,
        ...companyFormData,
        cultureMetrics: {
          workLifeBalance: 3,
          learning: 4,
          teamwork: 4,
          autonomy: 3,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/user"] });
      setIsCompanySetupOpen(false);
      toast({
        title: "Company Created",
        description: "Your company profile has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create company profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async () => {
      if (!company) throw new Error("Company not found");

      // Parse skill IDs to numbers
      const requiredSkills = opportunityFormData.requiredSkills.map(id => 
        typeof id === "string" ? parseInt(id) : id
      );

      return apiRequest("POST", "/api/opportunities", {
        companyId: company.id,
        title: opportunityFormData.title,
        description: opportunityFormData.description,
        location: opportunityFormData.location,
        locationType: opportunityFormData.locationType,
        salaryMin: opportunityFormData.salaryMin,
        salaryMax: opportunityFormData.salaryMax,
        salaryPeriod: opportunityFormData.salaryPeriod,
        employmentType: opportunityFormData.employmentType,
        requiredSkills,
        workSample: {
          description: opportunityFormData.workSampleDescription,
          tasks: opportunityFormData.workSampleTasks.split("\n").filter(t => t.trim()),
          deliverables: opportunityFormData.workSampleDeliverables.split("\n").filter(d => d.trim()),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/company"] });
      setIsOpportunityDialogOpen(false);
      resetOpportunityForm();
      toast({
        title: "Opportunity Created",
        description: "Your job opportunity has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job opportunity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // If error is 401 (unauthorized), redirect to login
    if (userError) {
      if ((userError as any).status === 401) {
        navigate("/login");
      }
    }
    
    // If user is candidate type, redirect to dashboard
    if (user && user.type === "candidate") {
      navigate("/dashboard");
    }
  }, [user, userError, navigate]);

  useEffect(() => {
    // Open company setup dialog if user is logged in but has no company
    if (user && !loadingCompany && !company) {
      setIsCompanySetupOpen(true);
    }
  }, [user, company, loadingCompany]);

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpportunityFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOpportunityFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillSelection = (skillId: string | number) => {
    const id = typeof skillId === "string" ? parseInt(skillId) : skillId;
    setOpportunityFormData(prev => {
      if (prev.requiredSkills.includes(id)) {
        return {
          ...prev,
          requiredSkills: prev.requiredSkills.filter(s => s !== id)
        };
      } else {
        return {
          ...prev,
          requiredSkills: [...prev.requiredSkills, id]
        };
      }
    });
  };

  const resetOpportunityForm = () => {
    setOpportunityFormData({
      title: "",
      description: "",
      location: "",
      locationType: "remote",
      salaryMin: 50000,
      salaryMax: 100000,
      salaryPeriod: "yearly",
      employmentType: "full-time",
      requiredSkills: [],
      workSampleDescription: "",
      workSampleTasks: "",
      workSampleDeliverables: "",
    });
  };

  const getApplicationsCount = () => {
    if (!applications) return 0;
    return applications.length;
  };

  const getActiveOpportunitiesCount = () => {
    if (!opportunities) return 0;
    return opportunities.filter(opp => opp.status === "active").length;
  };

  const getAverageMatchScore = () => {
    if (!applications || applications.length === 0) return 0;
    const sum = applications.reduce((acc, app) => acc + app.matchScore, 0);
    return Math.round(sum / applications.length);
  };

  const isLoading = loadingUser || loadingCompany || loadingOpportunities || loadingApplications;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-10">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-lg mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <TabNavigation candidateUrl="/dashboard" companyUrl="/company" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Overview */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {company ? `${company.name} Dashboard` : "Company Dashboard"}
          </h1>
          <p className="text-gray-600 mb-6">
            {company
              ? `Manage your job opportunities and find candidates based on verified skills.`
              : `Please set up your company profile to start posting opportunities.`}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Applications</p>
                    <p className="text-2xl font-semibold mt-1">{getApplicationsCount()}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 text-sm font-medium hover:text-blue-700"
                    onClick={() => document.getElementById("applications-tab")?.click()}
                  >
                    View applications →
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active Opportunities</p>
                    <p className="text-2xl font-semibold mt-1">{getActiveOpportunitiesCount()}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-md">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 text-sm font-medium hover:text-blue-700"
                    onClick={() => document.getElementById("opportunities-tab")?.click()}
                  >
                    Manage opportunities →
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Average Match Score</p>
                    <p className="text-2xl font-semibold mt-1">{getAverageMatchScore()}%</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-md">
                    <LineChart className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 text-xs">
                    {getAverageMatchScore() > 70 
                      ? "Great match quality for your opportunities!"
                      : "Consider adjusting your skill requirements"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Company Data Tabs */}
        <Tabs defaultValue="opportunities" className="mb-8">
          <TabsList>
            <TabsTrigger value="opportunities" id="opportunities-tab">Opportunities</TabsTrigger>
            <TabsTrigger value="applications" id="applications-tab">Applications</TabsTrigger>
            <TabsTrigger value="profile">Company Profile</TabsTrigger>
          </TabsList>
          
          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Job Opportunities</h2>
              <Button onClick={() => setIsOpportunityDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Post New Opportunity
              </Button>
            </div>
            
            {!company ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Set Up Your Company First</h3>
                  <p className="text-gray-500 mb-4">You need to create your company profile before posting job opportunities.</p>
                  <Button onClick={() => setIsCompanySetupOpen(true)}>Set Up Company Profile</Button>
                </CardContent>
              </Card>
            ) : opportunities && opportunities.length > 0 ? (
              <div className="space-y-6">
                {opportunities.map((opportunity) => (
                  <Card key={opportunity.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                            <Badge
                              className={opportunity.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              variant="outline"
                            >
                              {opportunity.status === "active" ? "Active" : "Closed"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-3">
                            <span>{opportunity.location} ({opportunity.locationType})</span> • 
                            <span> {opportunity.employmentType}</span>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{opportunity.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {opportunity.requiredSkills.map((skillId) => {
                              const skill = skills?.find(s => s.id === skillId);
                              return (
                                <Badge key={skillId} variant="outline" className="bg-blue-100 text-blue-800 border-none">
                                  {skill ? skill.name : `Skill ${skillId}`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="lg:ml-6 flex flex-col lg:items-end mt-4 lg:mt-0">
                          <div className="bg-green-50 rounded-md px-4 py-3 text-center mb-4">
                            <p className="text-sm font-medium text-green-800">Salary Range</p>
                            <p className="text-lg font-semibold text-green-900">
                              ${opportunity.salaryMin.toLocaleString()} - ${opportunity.salaryMax.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">
                              {opportunity.salaryPeriod === "yearly" ? "Annual" : opportunity.salaryPeriod === "monthly" ? "Monthly" : "Hourly"}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              {opportunity.status === "active" ? "Close" : "Reopen"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Opportunities Yet</h3>
                  <p className="text-gray-500 mb-4">Post your first job opportunity to start finding talented candidates.</p>
                  <Button onClick={() => setIsOpportunityDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Post New Opportunity
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidate Applications</h2>
            
            {!company ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Set Up Your Company First</h3>
                  <p className="text-gray-500 mb-4">You need to create your company profile before viewing applications.</p>
                  <Button onClick={() => setIsCompanySetupOpen(true)}>Set Up Company Profile</Button>
                </CardContent>
              </Card>
            ) : applications && applications.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                  {application.candidate.firstName && application.candidate.lastName
                                    ? `${application.candidate.firstName[0]}${application.candidate.lastName[0]}`
                                    : <User size={16} />}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                {application.candidate.firstName && application.candidate.lastName
                                  ? `${application.candidate.firstName} ${application.candidate.lastName}`
                                  : "Anonymous Candidate"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{application.opportunity.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${application.matchScore >= 90 ? "bg-green-100 text-green-800" : ""}
                                ${application.matchScore >= 70 && application.matchScore < 90 ? "bg-blue-100 text-blue-800" : ""}
                                ${application.matchScore < 70 ? "bg-yellow-100 text-yellow-800" : ""}
                              `}
                            >
                              {application.matchScore}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${application.status === "pending" ? "bg-blue-100 text-blue-800" : ""}
                                ${application.status === "shortlisted" ? "bg-green-100 text-green-800" : ""}
                                ${application.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                                ${application.status === "accepted" ? "bg-purple-100 text-purple-800" : ""}
                              `}
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={application.status}
                              onValueChange={(value) => 
                                updateApplicationStatusMutation.mutate({
                                  id: application.id,
                                  status: value
                                })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="shortlisted">Shortlist</SelectItem>
                                <SelectItem value="rejected">Reject</SelectItem>
                                <SelectItem value="accepted">Accept</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-4">
                    When candidates apply to your opportunities, they'll appear here.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("opportunities-tab")?.click()}
                  >
                    View Your Opportunities
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Company Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Profile</h2>
            
            {!company ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Set Up Your Company Profile</h3>
                  <p className="text-gray-500 mb-4">
                    Create your company profile to start posting job opportunities and finding talented candidates.
                  </p>
                  <Button onClick={() => setIsCompanySetupOpen(true)}>Set Up Now</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Company Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Company Name</span>
                          <p className="text-gray-900">{company.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Industry</span>
                          <p className="text-gray-900">{company.industry}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Location</span>
                          <p className="text-gray-900">{company.location}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Website</span>
                          <p className="text-gray-900">{company.website || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Company Culture</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Description</span>
                          <p className="text-gray-900">{company.cultureDescription || "Not provided"}</p>
                        </div>
                        
                        {company.cultureMetrics && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-500">Culture Metrics</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs text-gray-500">Work-Life Balance</span>
                                <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className="h-2 bg-green-500 rounded-full" 
                                    style={{ width: `${(company.cultureMetrics.workLifeBalance / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Learning Opportunities</span>
                                <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className="h-2 bg-blue-500 rounded-full" 
                                    style={{ width: `${(company.cultureMetrics.learning / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Teamwork</span>
                                <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className="h-2 bg-indigo-500 rounded-full" 
                                    style={{ width: `${(company.cultureMetrics.teamwork / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Autonomy</span>
                                <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className="h-2 bg-purple-500 rounded-full" 
                                    style={{ width: `${(company.cultureMetrics.autonomy / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button>Edit Company Profile</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Company Setup Dialog */}
      <Dialog open={isCompanySetupOpen} onOpenChange={setIsCompanySetupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Set Up Your Company Profile</DialogTitle>
            <DialogDescription>
              Enter your company information to get started with SkillSync.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); createCompanyMutation.mutate(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={companyFormData.name}
                  onChange={handleCompanyFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={companyFormData.industry}
                  onChange={handleCompanyFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={companyFormData.location}
                  onChange={handleCompanyFormChange}
                  placeholder="City, State, Country"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  value={companyFormData.website}
                  onChange={handleCompanyFormChange}
                  placeholder="https://yourcompany.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cultureDescription">Company Culture Description (Optional)</Label>
                <Textarea
                  id="cultureDescription"
                  name="cultureDescription"
                  value={companyFormData.cultureDescription}
                  onChange={handleCompanyFormChange}
                  placeholder="Describe your company culture and values..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createCompanyMutation.isPending}
              >
                {createCompanyMutation.isPending ? "Creating..." : "Create Company Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* New Opportunity Dialog */}
      <Dialog open={isOpportunityDialogOpen} onOpenChange={setIsOpportunityDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job Opportunity</DialogTitle>
            <DialogDescription>
              Create a work sample-based job opportunity to find the right talent.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); createOpportunityMutation.mutate(); }}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={opportunityFormData.title}
                    onChange={handleOpportunityFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={opportunityFormData.location}
                    onChange={handleOpportunityFormChange}
                    placeholder="City, State, Country"
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type *</Label>
                  <Select
                    value={opportunityFormData.locationType}
                    onValueChange={(value) => 
                      setOpportunityFormData(prev => ({ ...prev, locationType: value }))
                    }
                  >
                    <SelectTrigger id="locationType">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select
                    value={opportunityFormData.employmentType}
                    onValueChange={(value) => 
                      setOpportunityFormData(prev => ({ ...prev, employmentType: value }))
                    }
                  >
                    <SelectTrigger id="employmentType">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salaryPeriod">Salary Period *</Label>
                  <Select
                    value={opportunityFormData.salaryPeriod}
                    onValueChange={(value) => 
                      setOpportunityFormData(prev => ({ ...prev, salaryPeriod: value }))
                    }
                  >
                    <SelectTrigger id="salaryPeriod">
                      <SelectValue placeholder="Select salary period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary *</Label>
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    value={opportunityFormData.salaryMin}
                    onChange={(e) => 
                      setOpportunityFormData(prev => ({ 
                        ...prev, 
                        salaryMin: parseInt(e.target.value) 
                      }))
                    }
                    min={0}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary *</Label>
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    value={opportunityFormData.salaryMax}
                    onChange={(e) => 
                      setOpportunityFormData(prev => ({ 
                        ...prev, 
                        salaryMax: parseInt(e.target.value) 
                      }))
                    }
                    min={opportunityFormData.salaryMin}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={opportunityFormData.description}
                  onChange={handleOpportunityFormChange}
                  placeholder="Describe the role, responsibilities, and expectations..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Required Skills *</Label>
                <div className="border rounded-md p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills?.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant={opportunityFormData.requiredSkills.includes(skill.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSkillSelection(skill.id)}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select all skills that are required for this role. These will be used to match with candidates.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Work Sample Information</h3>
                <p className="text-sm text-gray-500">
                  Create a work sample that gives candidates a realistic preview of the actual work they would do in this role.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="workSampleDescription">Work Sample Description *</Label>
                  <Textarea
                    id="workSampleDescription"
                    name="workSampleDescription"
                    value={opportunityFormData.workSampleDescription}
                    onChange={handleOpportunityFormChange}
                    placeholder="Describe the work sample, context, and objectives..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workSampleTasks">Tasks (One per line) *</Label>
                  <Textarea
                    id="workSampleTasks"
                    name="workSampleTasks"
                    value={opportunityFormData.workSampleTasks}
                    onChange={handleOpportunityFormChange}
                    placeholder="Task 1&#10;Task 2&#10;Task 3"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500">List specific tasks the candidate would need to complete.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workSampleDeliverables">Deliverables (One per line) *</Label>
                  <Textarea
                    id="workSampleDeliverables"
                    name="workSampleDeliverables"
                    value={opportunityFormData.workSampleDeliverables}
                    onChange={handleOpportunityFormChange}
                    placeholder="Deliverable 1&#10;Deliverable 2&#10;Deliverable 3"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500">List what you expect candidates to submit or produce.</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsOpportunityDialogOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  createOpportunityMutation.isPending || 
                  opportunityFormData.requiredSkills.length === 0
                }
              >
                {createOpportunityMutation.isPending ? "Creating..." : "Post Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDashboard;
