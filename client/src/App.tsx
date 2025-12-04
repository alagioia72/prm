import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";

import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Tournaments from "@/pages/Tournaments";
import Rankings from "@/pages/Rankings";
import Players from "@/pages/Players";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import MyMatches from "@/pages/MyMatches";
import NotFound from "@/pages/not-found";

// todo: remove mock functionality - this simulates authentication state
const useMockAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const mockUser = {
    id: "1",
    firstName: "Marco",
    lastName: "Rossi",
    email: "marco.rossi@email.com",
    profileImageUrl: null,
    role: 'admin' as const,
    gender: 'male' as const,
    level: 'intermediate' as const,
  };
  
  return {
    user: isAuthenticated ? mockUser : null,
    isAuthenticated,
    isLoading,
  };
};

function Router() {
  const { user, isAuthenticated, isLoading } = useMockAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} isAuthenticated={isAuthenticated} />
      <Switch>
        <Route path="/">
          {isAuthenticated && user ? (
            <Home user={user} />
          ) : (
            <Landing isAuthenticated={false} />
          )}
        </Route>
        <Route path="/tournaments">
          <Tournaments isAdmin={user?.role === 'admin'} />
        </Route>
        <Route path="/rankings">
          <Rankings />
        </Route>
        <Route path="/players">
          <Players />
        </Route>
        <Route path="/profile">
          {isAuthenticated && user ? (
            <Profile user={user} />
          ) : (
            <Landing isAuthenticated={false} />
          )}
        </Route>
        <Route path="/my-matches">
          {isAuthenticated ? (
            <MyMatches />
          ) : (
            <Landing isAuthenticated={false} />
          )}
        </Route>
        <Route path="/admin">
          {isAuthenticated && user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Landing isAuthenticated={isAuthenticated} />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
