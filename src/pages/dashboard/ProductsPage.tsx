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
  ShoppingBag,
  Upload,
  DollarSign,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  cover_image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  sales_count: number;
  type: string;
}

const ProductsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "INR",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      // Get user's store
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) {
        setLoading(false);
        return;
      }

      setStoreId(store.id);

      // Fetch products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [user]);

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", currency: "INR" });
    setCoverFile(null);
    setProductFile(null);
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        currency: product.currency,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl.publicUrl;
  };

  const handleSave = async () => {
    if (!storeId || !user || !formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let coverUrl = editingProduct?.cover_image_url || null;
      let fileUrl = editingProduct?.file_url || null;
      let fileName = editingProduct?.file_name || null;

      // Upload cover image if provided
      if (coverFile) {
        const path = `${user.id}/${Date.now()}_cover_${coverFile.name}`;
        coverUrl = await uploadFile(coverFile, "media", path);
      }

      // Upload product file if provided
      if (productFile) {
        const path = `${user.id}/${Date.now()}_${productFile.name}`;
        fileUrl = await uploadFile(productFile, "products", path);
        fileName = productFile.name;
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        cover_image_url: coverUrl,
        file_url: fileUrl,
        file_name: fileName,
        store_id: storeId,
        user_id: user.id,
        type: "digital" as const,
        is_active: true,
      };

      if (editingProduct) {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) throw error;
        setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)));
        toast({ title: "Product updated", description: "Your product has been updated" });
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        setProducts([data, ...products]);
        toast({ title: "Product created", description: "Your product has been created" });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    } else {
      setProducts(products.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } else {
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: "Product deleted", description: "Your product has been deleted" });
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(price);
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
            You need to create your store before adding products.
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
            <h1 className="text-2xl font-bold font-display">Products</h1>
            <p className="text-muted-foreground">
              Manage your digital products.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <GradientButton onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </GradientButton>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Digital Product"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="99"
                        className="pl-9"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {coverFile ? coverFile.name : "Click to upload cover image"}
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product File</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <input
                      type="file"
                      onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {productFile ? productFile.name : "Click to upload product file"}
                      </p>
                    </label>
                  </div>
                </div>

                <GradientButton className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </GradientButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <GlassCard className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first digital product to start selling.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <GlassCard key={product.id} className="overflow-hidden">
                {product.cover_image_url ? (
                  <img
                    src={product.cover_image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover -m-4 mb-4"
                    style={{ width: "calc(100% + 2rem)" }}
                  />
                ) : (
                  <div className="w-full h-40 bg-secondary -m-4 mb-4 flex items-center justify-center"
                    style={{ width: "calc(100% + 2rem)" }}>
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{product.name}</h3>
                    <p className="text-lg font-bold gradient-text">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales_count || 0} sales
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={(checked) => handleToggle(product.id, checked)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
