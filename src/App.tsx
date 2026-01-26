import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Onboarding */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/store" element={<Dashboard />} />
            <Route path="/dashboard/products" element={<Dashboard />} />
            <Route path="/dashboard/memberships" element={<Dashboard />} />
            <Route path="/dashboard/bookings" element={<Dashboard />} />
            <Route path="/dashboard/links" element={<Dashboard />} />
            <Route path="/dashboard/analytics" element={<Dashboard />} />
            <Route path="/dashboard/payouts" element={<Dashboard />} />
            <Route path="/dashboard/settings" element={<Dashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
