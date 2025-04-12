import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { CheckCircle, Briefcase, Users, Lock, BarChart } from "lucide-react";

const Home = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              <span className="text-primary-600">Skill</span>
              <span className="text-green-500">Sync</span>
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              The Anti-Resume Talent Platform. Match with opportunities based on your verified skills, not just your résumé.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register">
                <Button size="lg" className="mr-4">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How SkillSync Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              We're changing how hiring works by focusing on verified skills, not resumés.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">1. Complete Skill Challenges</h3>
                <p className="mt-2 text-base text-gray-500">
                  Demonstrate your abilities through standardized challenges that verify your skills.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">2. Build Your Skill Profile</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get matched based on your verified skills and actual performance metrics.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">3. Connect with Opportunities</h3>
                <p className="mt-2 text-base text-gray-500">
                  Companies see your skills, not your background, for bias-free initial matching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Core Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Core Platform Features</h2>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-100 text-green-600 mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Skills-First Approach</h3>
                </div>
                <p className="text-gray-600">
                  Our platform prioritizes demonstrated abilities over resume claims, ensuring that talent is matched based on verified skills.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-600 mr-4">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Bias Reduction</h3>
                </div>
                <p className="text-gray-600">
                  Anonymous profiles and objective data drive initial matching, reducing unconscious bias in the hiring process.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600 mr-4">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Transparent Expectations</h3>
                </div>
                <p className="text-gray-600">
                  Clear information about roles, salary ranges, and company culture helps candidates make informed decisions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-yellow-100 text-yellow-600 mr-4">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Real-World Work Samples</h3>
                </div>
                <p className="text-gray-600">
                  Companies post actual work samples instead of vague job descriptions, giving candidates a realistic preview.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-primary-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to transform your hiring or job search?
          </h2>
          <p className="mt-4 max-w-md mx-auto text-xl text-primary-100">
            Join SkillSync today and experience a meritocratic approach to talent matching.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="mr-4 bg-white text-primary-700 hover:bg-gray-100">
                Get Started Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-white font-bold text-xl">
                Skill<span className="text-green-400">Sync</span>
              </span>
              <p className="text-gray-400 mt-2 text-sm">
                The Anti-Resume Talent Platform
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Blog
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Careers
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
