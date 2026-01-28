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
import StorePage from "./pages/StorePage";
import LinksPage from "./pages/dashboard/LinksPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import DashboardStorePage from "./pages/dashboard/StorePage";
import MembershipsPage from "./pages/dashboard/MembershipsPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import PayoutsPage from "./pages/dashboard/PayoutsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

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
            
            {/* Public Store Page */}
            <Route path="/s/:subdomain" element={<StorePage />} />
            
            {/* Onboarding */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Dashboard routes */}
           <Route path="/dashboard" element={<Dashboard />}>
  <Route path="store" element={<DashboardStorePage />} />
  <Route path="products" element={<ProductsPage />} />
  <Route path="memberships" element={<MembershipsPage />} />
  <Route path="bookings" element={<BookingsPage />} />
  <Route path="links" element={<LinksPage />} />
  <Route path="analytics" element={<AnalyticsPage />} />
  <Route path="payouts" element={<PayoutsPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>

            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
