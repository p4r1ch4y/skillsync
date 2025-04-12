import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Challenges from "@/pages/Challenges";
import Opportunities from "@/pages/Opportunities";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import CompanyDashboard from "@/pages/CompanyDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/messages" component={Messages} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/company" component={CompanyDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
