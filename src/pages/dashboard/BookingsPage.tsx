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
  Calendar,
  Clock,
  Save,
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

interface BookingType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  buffer_before: number | null;
  buffer_after: number | null;
  is_active: boolean | null;
}

const BookingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "30",
    buffer_before: "0",
    buffer_after: "15",
  });

  useEffect(() => {
    const fetchBookingTypes = async () => {
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
        .from("booking_types")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching booking types:", error);
      } else {
        setBookingTypes(data || []);
      }
      setLoading(false);
    };

    fetchBookingTypes();
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "30",
      buffer_before: "0",
      buffer_after: "15",
    });
    setEditingBooking(null);
  };

  const openEditDialog = (booking: BookingType) => {
    setEditingBooking(booking);
    setFormData({
      name: booking.name,
      description: booking.description || "",
      price: booking.price.toString(),
      duration: booking.duration.toString(),
      buffer_before: (booking.buffer_before || 0).toString(),
      buffer_after: (booking.buffer_after || 15).toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!storeId || !user || !formData.name || !formData.price) return;

    const bookingData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      currency: "INR",
      duration: parseInt(formData.duration),
      buffer_before: parseInt(formData.buffer_before),
      buffer_after: parseInt(formData.buffer_after),
      store_id: storeId,
      user_id: user.id,
      is_active: true,
    };

    if (editingBooking) {
      const { error } = await supabase
        .from("booking_types")
        .update(bookingData)
        .eq("id", editingBooking.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update booking type", variant: "destructive" });
      } else {
        setBookingTypes(bookingTypes.map((b) =>
          b.id === editingBooking.id ? { ...b, ...bookingData } : b
        ));
        toast({ title: "Updated!", description: "Booking type updated successfully" });
      }
    } else {
      const { data, error } = await supabase
        .from("booking_types")
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to create booking type", variant: "destructive" });
      } else {
        setBookingTypes([data, ...bookingTypes]);
        toast({ title: "Created!", description: "Booking type created successfully" });
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("booking_types").update({ is_active: isActive }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update booking type", variant: "destructive" });
    } else {
      setBookingTypes(bookingTypes.map((b) => (b.id === id ? { ...b, is_active: isActive } : b)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("booking_types").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete booking type", variant: "destructive" });
    } else {
      setBookingTypes(bookingTypes.filter((b) => b.id !== id));
      toast({ title: "Deleted", description: "Booking type deleted successfully" });
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
            Create your store before adding booking types.
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
            <h1 className="text-2xl font-bold font-display">Bookings</h1>
            <p className="text-muted-foreground">
              Create 1:1 call or session types for your audience
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <GradientButton>
                <Plus className="w-4 h-4 mr-2" />
                Add Booking Type
              </GradientButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBooking ? "Edit Booking Type" : "Create Booking Type"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    placeholder="1:1 Coaching Call"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What will you discuss in this session..."
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
                      placeholder="999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buffer_before">Buffer Before</Label>
                    <Select
                      value={formData.buffer_before}
                      onValueChange={(value) => setFormData({ ...formData, buffer_before: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_after">Buffer After</Label>
                    <Select
                      value={formData.buffer_after}
                      onValueChange={(value) => setFormData({ ...formData, buffer_after: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <GradientButton className="w-full" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingBooking ? "Update Booking Type" : "Create Booking Type"}
                </GradientButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Booking Types Grid */}
        {bookingTypes.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No booking types yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first booking type to start accepting appointments.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookingTypes.map((booking) => (
              <GlassCard key={booking.id} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <Switch
                    checked={booking.is_active ?? true}
                    onCheckedChange={(checked) => handleToggle(booking.id, checked)}
                  />
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{booking.name}</h3>
                <p className="text-2xl font-bold mb-2">₹{booking.price}</p>
                
                {booking.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {booking.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{booking.duration} min</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(booking)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(booking.id)}
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

export default BookingsPage;
