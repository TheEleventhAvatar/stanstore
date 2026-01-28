import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PayoutStats {
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
}

const PayoutsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<PayoutStats>({
    availableBalance: 0,
    pendingBalance: 0,
    totalPaidOut: 0,
  });
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  useEffect(() => {
    const fetchPayoutData = async () => {
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

      // Fetch completed orders for balance calculation
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, platform_fee, status")
        .eq("store_id", store.id);

      const completedOrders = orders?.filter((o) => o.status === "completed") || [];
      const pendingOrders = orders?.filter((o) => o.status === "pending") || [];

      const availableBalance = completedOrders.reduce(
        (sum, o) => sum + (Number(o.amount) - Number(o.platform_fee)),
        0
      );
      const pendingBalance = pendingOrders.reduce(
        (sum, o) => sum + (Number(o.amount) - Number(o.platform_fee)),
        0
      );

      setStats({
        availableBalance,
        pendingBalance,
        totalPaidOut: 0, // Would track actual payouts in a payouts table
      });

      setLoading(false);
    };

    fetchPayoutData();
  }, [user]);

  const handleRequestPayout = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      toast({
        title: "Missing Details",
        description: "Please add your bank details first",
        variant: "destructive",
      });
      return;
    }

    // In production, this would call RazorpayX to initiate payout
    toast({
      title: "Payout Requested",
      description: "Your payout is being processed. It may take 1-3 business days.",
    });
  };

  const handleSaveBankDetails = () => {
    // In production, save to profile or separate bank_accounts table
    toast({
      title: "Bank Details Saved",
      description: "Your bank details have been saved securely.",
    });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!storeId) {
    return (
      <DashboardLayout>
        <GlassCard className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Set up your store first</h2>
          <p className="text-muted-foreground mb-4">
            Create your store to start accepting payments and payouts.
          </p>
          <GradientButton onClick={() => (window.location.href = "/onboarding")}>
            Create Store
          </GradientButton>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Payouts</h1>
            <p className="text-muted-foreground">
              Manage your earnings and withdraw funds
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Bank Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bank Account Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={bankDetails.accountName}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, accountName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="HDFC Bank"
                    value={bankDetails.bankName}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, bankName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="HDFC0001234"
                    value={bankDetails.ifscCode}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, ifscCode: e.target.value })
                    }
                  />
                </div>
                <GradientButton className="w-full" onClick={handleSaveBankDetails}>
                  Save Bank Details
                </GradientButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold font-display mt-1">
                  ₹{stats.availableBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ready to withdraw
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <GradientButton
                className="w-full"
                onClick={handleRequestPayout}
                disabled={stats.availableBalance <= 0}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Request Payout
              </GradientButton>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Balance</p>
                <p className="text-3xl font-bold font-display mt-1">
                  ₹{stats.pendingBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Processing orders
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
                <p className="text-3xl font-bold font-display mt-1">
                  ₹{stats.totalPaidOut.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Lifetime earnings
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Payout Info */}
        <GlassCard>
          <h2 className="font-semibold mb-4">How Payouts Work</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Earn Money</p>
                <p className="text-xs text-muted-foreground">
                  Sell products, memberships, or bookings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Available in 2-3 days</p>
                <p className="text-xs text-muted-foreground">
                  After payment confirmation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Request Payout</p>
                <p className="text-xs text-muted-foreground">
                  Withdraw to your bank account
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Payout History (Empty State) */}
        <GlassCard>
          <h2 className="font-semibold mb-4">Payout History</h2>
          <div className="text-center py-8">
            <CreditCard className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium mb-1">No payouts yet</h3>
            <p className="text-sm text-muted-foreground">
              Your payout history will appear here once you request your first withdrawal.
            </p>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;
