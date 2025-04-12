import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

const Register = () => {
  const [userType, setUserType] = useState("candidate");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const validateForm = () => {
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/register", {
        firstName,
        lastName,
        email,
        username,
        password,
        type: userType,
      });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You are now logged in.",
      });
      
      // Redirect based on user type
      if (userType === "company") {
        navigate("/company");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Username or email may already be in use.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold">
              <span className="text-primary-600">Skill</span>
              <span className="text-green-500">Sync</span>
            </h1>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start building your skill profile or find talent
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Sign up to get started with SkillSync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="candidate" onValueChange={setUserType} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="candidate">I'm a Candidate</TabsTrigger>
                <TabsTrigger value="company">I'm a Company</TabsTrigger>
              </TabsList>
              <TabsContent value="candidate">
                <p className="text-sm text-gray-500 mt-2">
                  Create a candidate account to showcase your skills and find opportunities
                </p>
              </TabsContent>
              <TabsContent value="company">
                <p className="text-sm text-gray-500 mt-2">
                  Create a company account to find talented candidates based on verified skills
                </p>
              </TabsContent>
            </Tabs>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{" "}
              <Link href="/login">
                <a className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
