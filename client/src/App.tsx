import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth.tsx";

import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Tournaments from "@/pages/Tournaments";
import Rankings from "@/pages/Rankings";
import Players from "@/pages/Players";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import MyMatches from "@/pages/MyMatches";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import VerifyEmail from "@/pages/VerifyEmail";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navUser = user ? {
    ...user,
    profileImageUrl: null,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={navUser} isAuthenticated={isAuthenticated} />
      <Switch>
        <Route path="/">
          {isAuthenticated && user ? (
            <Home user={{ ...user, profileImageUrl: null }} />
          ) : (
            <Landing isAuthenticated={false} />
          )}
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/login">
          <Login onLogin={login} />
        </Route>
        <Route path="/verify-email">
          <VerifyEmail />
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
            <Profile user={{ ...user, profileImageUrl: null }} />
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
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
