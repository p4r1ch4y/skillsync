import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sliders, Briefcase, Building } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Company {
  id: number;
  name: string;
  industry: string;
  location: string;
  website: string;
  cultureDescription: string;
}

interface Opportunity {
  id: number;
  title: string;
  description: string;
  companyId: number;
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
  company: Company;
  matchScore: number;
}

interface User {
  id: number;
  type: string;
}

const Opportunities = () => {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [locationTypeFilter, setLocationTypeFilter] = useState("");
  const [salaryMinFilter, setSalaryMinFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: loadingUser, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: opportunities, isLoading: loadingOpportunities } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: skills, isLoading: loadingSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const applyMutation = useMutation({
    mutationFn: async (opportunityId: number) => {
      if (!user) throw new Error("User not authenticated");
      return apiRequest("POST", "/api/applications", {
        userId: user.id,
        opportunityId,
        matchScore: selectedOpportunity?.matchScore || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setSelectedOpportunity(null);
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. You may have already applied for this opportunity.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // If error is 401 (unauthorized), redirect to login
    if (userError) {
      if ((userError as any).status === 401) {
        navigate("/login");
      }
    }
  }, [userError, navigate]);

  // Get unique locations from opportunities
  const locations = opportunities
    ? [...new Set(opportunities.map(opportunity => opportunity.location))]
    : [];

  // Filter opportunities based on search and filters
  const filteredOpportunities = opportunities
    ? opportunities.filter(opportunity => {
        const matchesSearch =
          searchQuery === "" ||
          opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opportunity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opportunity.company.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation =
          locationFilter === "" || opportunity.location === locationFilter;

        const matchesLocationType =
          locationTypeFilter === "" || opportunity.locationType === locationTypeFilter;

        const matchesSalaryMin =
          salaryMinFilter === "" || opportunity.salaryMin >= parseInt(salaryMinFilter);

        const matchesEmploymentType =
          employmentTypeFilter === "" || opportunity.employmentType === employmentTypeFilter;

        return matchesSearch && matchesLocation && matchesLocationType && matchesSalaryMin && matchesEmploymentType;
      })
    : [];

  // Sort opportunities by match score if user is logged in
  const sortedOpportunities = [...(filteredOpportunities || [])].sort((a, b) => {
    if (user) {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    return 0;
  });

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const submitApplication = () => {
    if (selectedOpportunity) {
      applyMutation.mutate(selectedOpportunity.id);
    }
  };

  const isLoading = loadingUser || loadingOpportunities || loadingSkills;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Skeleton className="h-10 w-full md:w-2/3" />
              <Skeleton className="h-10 w-full md:w-1/3" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Opportunity Matches</h1>
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search for job titles, companies, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Sliders size={16} />
            Filters
          </Button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any location</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Work Type</label>
                  <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Minimum Salary</label>
                  <Select value={salaryMinFilter} onValueChange={setSalaryMinFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any salary</SelectItem>
                      <SelectItem value="50000">$50K+</SelectItem>
                      <SelectItem value="75000">$75K+</SelectItem>
                      <SelectItem value="100000">$100K+</SelectItem>
                      <SelectItem value="125000">$125K+</SelectItem>
                      <SelectItem value="150000">$150K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Employment Type</label>
                  <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any employment type</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Opportunities List */}
        <div className="space-y-6">
          {sortedOpportunities.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-2">No opportunities match your search or filters.</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters to see more results.</p>
            </div>
          ) : (
            sortedOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <OpportunityCard opportunity={opportunity} skills={skills} />
                  </div>
                  
                  <Accordion type="single" collapsible className="border-t border-gray-200">
                    <AccordionItem value="details" className="border-b-0">
                      <AccordionTrigger className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600">
                        View Work Sample Details
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-700 space-y-4">
                          <p>{opportunity.workSample.description}</p>
                          
                          {opportunity.workSample.tasks && opportunity.workSample.tasks.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Tasks:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {opportunity.workSample.tasks.map((task, index) => (
                                  <li key={index}>{task}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {opportunity.workSample.deliverables && opportunity.workSample.deliverables.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Deliverables:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {opportunity.workSample.deliverables.map((deliverable, index) => (
                                  <li key={index}>{deliverable}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {user && user.type === "candidate" && (
                            <div className="pt-4">
                              <Button onClick={() => handleApply(opportunity)}>
                                Apply for this Opportunity
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Apply Dialog */}
        <Dialog open={!!selectedOpportunity} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for {selectedOpportunity?.title}</DialogTitle>
              <DialogDescription>
                Your application will include your verified skill profile. Your personal details will remain hidden until you're shortlisted.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="flex items-center gap-3">
                <Building className="text-gray-400" size={18} />
                <span className="text-gray-700">{selectedOpportunity?.company.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="text-gray-400" size={18} />
                <span className="text-gray-700">{selectedOpportunity?.employmentType}</span>
              </div>
              
              {selectedOpportunity && selectedOpportunity.matchScore > 0 && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-green-800 text-sm font-medium">
                    You have a {selectedOpportunity.matchScore}% match with this opportunity based on your verified skills.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOpportunity(null)}>
                Cancel
              </Button>
              <Button 
                onClick={submitApplication} 
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Opportunities;
