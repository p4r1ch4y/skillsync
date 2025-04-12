import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import SkillProfile from "@/components/dashboard/SkillProfile";
import SkillChallenges from "@/components/dashboard/SkillChallenges";
import OpportunityMatches from "@/components/dashboard/OpportunityMatches";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import UserOnboarding from "@/components/dashboard/UserOnboarding";
import TabNavigation from "@/components/layout/TabNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
  bio?: string;
  title?: string;
  education?: string;
  experience?: string;
  location?: string;
}

const Dashboard = () => {
  const [_, navigate] = useLocation();
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    // If user type is company, redirect to company dashboard
    if (user && user.type === "company") {
      navigate("/company");
    }
    
    // If error is 401 (unauthorized), redirect to login
    if (error) {
      if ((error as any).status === 401) {
        navigate("/login");
      }
    }
  }, [user, error, navigate]);

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
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-80 w-full rounded-lg" />
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
        {/* Onboarding component will show automatically for new users */}
        <UserOnboarding />
        
        <DashboardOverview userName={user.firstName} />
        
        {/* Profile completion prompt for users who haven't filled out their profile */}
        <ProfileCompletion />
        
        <SkillProfile />
        <SkillChallenges />
        <OpportunityMatches />

        {/* New Analytics and Recent Activity sections */}
        <AnalyticsOverview userId={user.id} />
        <RecentActivity userId={user.id} />
      </main>
    </div>
  );
};

export default Dashboard;
