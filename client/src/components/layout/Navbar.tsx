import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, Menu } from "lucide-react";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
}

const Navbar = () => {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 60000,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (user?: User) => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary-600 font-bold text-xl cursor-pointer">
                  Skill<span className="text-green-500">Sync</span>
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user && (
                <>
                  <Link href={user.type === "company" ? "/company" : "/dashboard"}>
                    <a
                      className={`${
                        location === "/dashboard" || location === "/company"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Dashboard
                    </a>
                  </Link>
                  {user.type === "candidate" && (
                    <Link href="/challenges">
                      <a
                        className={`${
                          location === "/challenges"
                            ? "border-primary-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Challenges
                      </a>
                    </Link>
                  )}
                  <Link href="/opportunities">
                    <a
                      className={`${
                        location === "/opportunities"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Opportunities
                    </a>
                  </Link>
                  <Link href="/messages">
                    <a
                      className={`${
                        location === "/messages"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Messages
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && user ? (
              <>
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-primary-100 text-primary-700">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-4 py-2 text-sm font-medium">
                        <p className="text-gray-700">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/profile")}
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/settings")}
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-primary-600">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href={user.type === "company" ? "/company" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <a
                    className={`${
                      location === "/dashboard" || location === "/company"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Dashboard
                  </a>
                </Link>
                {user.type === "candidate" && (
                  <Link href="/challenges" onClick={() => setMobileMenuOpen(false)}>
                    <a
                      className={`${
                        location === "/challenges"
                          ? "bg-primary-50 border-primary-500 text-primary-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                    >
                      Challenges
                    </a>
                  </Link>
                )}
                <Link href="/opportunities" onClick={() => setMobileMenuOpen(false)}>
                  <a
                    className={`${
                      location === "/opportunities"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Opportunities
                  </a>
                </Link>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                  <a
                    className={`${
                      location === "/messages"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Messages
                  </a>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <a
                    className={`${
                      location === "/profile"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Profile
                  </a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <a className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Log in
                  </a>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <a className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Sign up
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
