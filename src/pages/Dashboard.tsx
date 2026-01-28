import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Plus,
  Store,
  ExternalLink,
} from "lucide-react";

interface StoreData {
  id: string;
  display_name: string;
  subdomain: string;
  is_published: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("stores")
        .select("id, display_name, subdomain, is_published")
        .eq("user_id", user.id)
        .single();

      setStore(data);
      setLoading(false);
    };

    fetchStore();
  }, [user]);

  const stats = [
    {
      label: "Total Revenue",
      value: "$0.00",
      change: "+0%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Orders",
      value: "0",
      change: "+0%",
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Subscribers",
      value: "0",
      change: "+0%",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Page Views",
      value: "0",
      change: "+0%",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    { label: "Add Product", href: "/dashboard/products", icon: Plus },
    { label: "Customize Store", href: "/dashboard/store", icon: Store },
    { label: "View Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          {store && (
            <a
              href={`https://${store.subdomain}.stan.store`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              {store.subdomain}.stan.store
            </a>
          )}
        </div>

        {/* No store setup prompt */}
        {!store && (
          <GlassCard className="gradient-border p-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">Set up your store</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your personalized store to start selling digital products, memberships, and bookings.
            </p>
            <Link to="/onboarding">
              <GradientButton>
                Create my store
                <ArrowRight className="w-5 h-5 ml-2" />
              </GradientButton>
            </Link>
          </GlassCard>
        )}

        {/* Stats Grid */}
        {store && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <GlassCard key={index} className="relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold font-display mt-1">{stat.value}</p>
                      <p className="text-xs text-green-500 mt-1">{stat.change} from last month</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold font-display mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.href}>
                    <GlassCard variant="hover" className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{action.label}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </div>

            <Outlet />

            {/* Recent Activity / Empty State */}
            <div>
              <h2 className="text-lg font-semibold font-display mb-4">Recent Orders</h2>
              <GlassCard className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No orders yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  When you get your first order, it will appear here.
                </p>
                <Link to="/dashboard/products">
                  <GradientButton variant="outline" size="sm">
                    Add your first product
                  </GradientButton>
                </Link>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
