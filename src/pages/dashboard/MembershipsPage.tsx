import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Users,
  Save,
  X,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Membership {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  benefits: string[] | null;
  is_active: boolean | null;
  member_count: number | null;
}

const MembershipsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month",
    benefits: "",
  });

  useEffect(() => {
    const fetchMemberships = async () => {
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

      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching memberships:", error);
      } else {
        setMemberships(data || []);
      }
      setLoading(false);
    };

    fetchMemberships();
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      interval: "month",
      benefits: "",
    });
    setEditingMembership(null);
  };

  const openEditDialog = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      name: membership.name,
      description: membership.description || "",
      price: membership.price.toString(),
      interval: membership.interval,
      benefits: membership.benefits?.join("\n") || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!storeId || !user || !formData.name || !formData.price) return;

    const benefitsArray = formData.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const membershipData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      currency: "INR",
      interval: formData.interval,
      benefits: benefitsArray,
      store_id: storeId,
      user_id: user.id,
      is_active: true,
    };

    if (editingMembership) {
      const { error } = await supabase
        .from("memberships")
        .update(membershipData)
        .eq("id", editingMembership.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update membership", variant: "destructive" });
      } else {
        setMemberships(memberships.map((m) =>
          m.id === editingMembership.id ? { ...m, ...membershipData } : m
        ));
        toast({ title: "Updated!", description: "Membership updated successfully" });
      }
    } else {
      const { data, error } = await supabase
        .from("memberships")
        .insert(membershipData)
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to create membership", variant: "destructive" });
      } else {
        setMemberships([data, ...memberships]);
        toast({ title: "Created!", description: "Membership created successfully" });
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("memberships").update({ is_active: isActive }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update membership", variant: "destructive" });
    } else {
      setMemberships(memberships.map((m) => (m.id === id ? { ...m, is_active: isActive } : m)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("memberships").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete membership", variant: "destructive" });
    } else {
      setMemberships(memberships.filter((m) => m.id !== id));
      toast({ title: "Deleted", description: "Membership deleted successfully" });
    }
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
            Create your store before adding memberships.
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
            <h1 className="text-2xl font-bold font-display">Memberships</h1>
            <p className="text-muted-foreground">
              Create recurring membership tiers for your subscribers
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <GradientButton>
                <Plus className="w-4 h-4 mr-2" />
                Add Membership
              </GradientButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMembership ? "Edit Membership" : "Create Membership"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Membership Name</Label>
                  <Input
                    id="name"
                    placeholder="Pro Membership"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's included in this membership..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="499"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Billing Interval</Label>
                    <Select
                      value={formData.interval}
                      onValueChange={(value) => setFormData({ ...formData, interval: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Access to exclusive content&#10;Monthly Q&A sessions&#10;Early access to new products"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={4}
                  />
                </div>
                <GradientButton className="w-full" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingMembership ? "Update Membership" : "Create Membership"}
                </GradientButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Memberships Grid */}
        {memberships.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Crown className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No memberships yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first membership tier to start earning recurring revenue.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memberships.map((membership) => (
              <GlassCard key={membership.id} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <Switch
                    checked={membership.is_active ?? true}
                    onCheckedChange={(checked) => handleToggle(membership.id, checked)}
                  />
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{membership.name}</h3>
                <p className="text-2xl font-bold mb-2">
                  ₹{membership.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{membership.interval}
                  </span>
                </p>
                
                {membership.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {membership.description}
                  </p>
                )}

                {membership.benefits && membership.benefits.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {membership.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {benefit}
                      </li>
                    ))}
                    {membership.benefits.length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        +{membership.benefits.length - 3} more
                      </li>
                    )}
                  </ul>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4" />
                  <span>{membership.member_count || 0} members</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(membership)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(membership.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MembershipsPage;
