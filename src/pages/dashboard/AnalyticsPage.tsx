import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalSubscribers: number;
  totalLinkClicks: number;
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalSubscribers: 0,
    totalLinkClicks: 0,
  });

  // Mock chart data - in real app, this would come from analytics
  const revenueData = [
    { name: "Mon", revenue: 0 },
    { name: "Tue", revenue: 0 },
    { name: "Wed", revenue: 0 },
    { name: "Thu", revenue: 0 },
    { name: "Fri", revenue: 0 },
    { name: "Sat", revenue: 0 },
    { name: "Sun", revenue: 0 },
  ];

  const ordersData = [
    { name: "Products", value: 0 },
    { name: "Memberships", value: 0 },
    { name: "Bookings", value: 0 },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!store) {
        setLoading(false);
        return;
      }

      setStoreId(store.id);

      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, status")
        .eq("store_id", store.id)
        .eq("status", "completed");

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("store_id", store.id)
        .eq("status", "active");

      // Fetch link clicks
      const { data: links } = await supabase
        .from("links")
        .select("click_count")
        .eq("store_id", store.id);

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      const totalLinkClicks = links?.reduce((sum, l) => sum + (l.click_count || 0), 0) || 0;

      setStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalSubscribers: subscriptions?.length || 0,
        totalLinkClicks,
      });

      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      change: "+0%",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      change: "+0%",
    },
    {
      label: "Active Subscribers",
      value: stats.totalSubscribers.toString(),
      icon: Users,
      color: "from-purple-500 to-pink-500",
      change: "+0%",
    },
    {
      label: "Link Clicks",
      value: stats.totalLinkClicks.toString(),
      icon: MousePointerClick,
      color: "from-orange-500 to-red-500",
      change: "+0%",
    },
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display">Analytics</h1>
          <p className="text-muted-foreground">
            Track your store's performance and growth
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Revenue Overview</h2>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Orders by Type */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Orders by Type</h2>
                <p className="text-sm text-muted-foreground">All time</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Empty state for more analytics */}
        <GlassCard className="text-center py-8">
          <Eye className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-medium mb-1">More analytics coming soon</h3>
          <p className="text-sm text-muted-foreground">
            Page views, conversion rates, and detailed insights will be available here.
          </p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
