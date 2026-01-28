import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, ExternalLink, Palette, Globe, Image as ImageIcon } from "lucide-react";

interface StoreData {
  id: string;
  display_name: string;
  subdomain: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  is_published: boolean | null;
}

const StorePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    subdomain: "",
    description: "",
    primary_color: "#8B5CF6",
    secondary_color: "#D946EF",
  });

  useEffect(() => {
    const fetchStore = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store:", error);
      } else if (data) {
        setStore(data);
        setFormData({
          display_name: data.display_name || "",
          subdomain: data.subdomain || "",
          description: data.description || "",
          primary_color: data.primary_color || "#8B5CF6",
          secondary_color: data.secondary_color || "#D946EF",
        });
      }
      setLoading(false);
    };

    fetchStore();
  }, [user]);

  const handleSave = async () => {
    if (!store) return;

    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({
        display_name: formData.display_name,
        description: formData.description,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      })
      .eq("id", store.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved!",
        description: "Your store settings have been updated",
      });
    }
    setSaving(false);
  };

  const togglePublish = async () => {
    if (!store) return;

    const newStatus = !store.is_published;
    const { error } = await supabase
      .from("stores")
      .update({ is_published: newStatus })
      .eq("id", store.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    } else {
      setStore({ ...store, is_published: newStatus });
      toast({
        title: newStatus ? "Published!" : "Unpublished",
        description: newStatus
          ? "Your store is now live"
          : "Your store is now hidden",
      });
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

  if (!store) {
    return (
      <DashboardLayout>
        <GlassCard className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Set up your store first</h2>
          <p className="text-muted-foreground mb-4">
            Complete the onboarding to create your store.
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
            <h1 className="text-2xl font-bold font-display">Store Settings</h1>
            <p className="text-muted-foreground">
              Customize your store's appearance and settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={`/s/${store.subdomain}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </a>
            </Button>
            <Button
              variant={store.is_published ? "outline" : "default"}
              onClick={togglePublish}
            >
              {store.is_published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">Your store's identity</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Store Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="My Awesome Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Store URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    disabled
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">.stan.store</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact support to change your subdomain
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell visitors about yourself and what you offer..."
                  rows={4}
                />
              </div>
            </div>
          </GlassCard>

          {/* Branding */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Branding</h2>
                <p className="text-sm text-muted-foreground">Customize your colors</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primary_color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    className="w-12 h-12 rounded-lg border border-input cursor-pointer"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondary_color"
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                    className="w-12 h-12 rounded-lg border border-input cursor-pointer"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-full h-12 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <GradientButton onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </GradientButton>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StorePage;
