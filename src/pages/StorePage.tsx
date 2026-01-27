import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { useRazorpay } from "@/hooks/useRazorpay";
import {
  Instagram,
  Twitter,
  Youtube,
  ExternalLink,
  ShoppingBag,
  Users,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";

interface StoreData {
  id: string;
  display_name: string;
  subdomain: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  theme: string | null;
  profile: {
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    youtube_url: string | null;
    website: string | null;
  };
}

interface LinkData {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  position: number;
}

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  cover_image_url: string | null;
  type: string;
  is_active: boolean;
}

interface MembershipData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  benefits: string[] | null;
  cover_image_url: string | null;
  is_active: boolean;
}

interface BookingData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  cover_image_url: string | null;
  is_active: boolean;
}

const StorePage = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"links" | "products" | "memberships" | "bookings">("links");
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!subdomain) return;

      // Fetch store with profile
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select(`
          *,
          profile:profiles!stores_profile_id_fkey (
            full_name,
            bio,
            avatar_url,
            instagram_url,
            twitter_url,
            youtube_url,
            website
          )
        `)
        .eq("subdomain", subdomain)
        .eq("is_published", true)
        .single();

      if (storeError || !storeData) {
        console.error("Store not found:", storeError);
        setLoading(false);
        return;
      }

      setStore(storeData as unknown as StoreData);

      // Fetch all store content in parallel
      const [linksRes, productsRes, membershipsRes, bookingsRes] = await Promise.all([
        supabase
          .from("links")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("position", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("memberships")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("price", { ascending: true }),
        supabase
          .from("booking_types")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("price", { ascending: true }),
      ]);

      setLinks(linksRes.data || []);
      setProducts(productsRes.data || []);
      setMemberships(membershipsRes.data || []);
      setBookings(bookingsRes.data || []);
      setLoading(false);
    };

    fetchStoreData();
  }, [subdomain]);

  const handlePurchase = async (itemId: string, itemType: "digital" | "membership" | "booking") => {
    if (!store) return;
    await initiatePayment({
      productId: itemId,
      productType: itemType,
      storeId: store.id,
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Store not found</h1>
          <p className="text-muted-foreground">This store doesn't exist or isn't published yet.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "links", label: "Links", icon: LinkIcon, count: links.length },
    { id: "products", label: "Products", icon: ShoppingBag, count: products.length },
    { id: "memberships", label: "Memberships", icon: Users, count: memberships.length },
    { id: "bookings", label: "Book a Call", icon: Calendar, count: bookings.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {store.cover_image_url && (
        <div className="h-48 sm:h-64 relative">
          <img
            src={store.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      {/* Profile Section */}
      <div className={`max-w-lg mx-auto px-4 ${store.cover_image_url ? "-mt-16" : "pt-8"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-primary p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              {store.profile?.avatar_url ? (
                <img
                  src={store.profile.avatar_url}
                  alt={store.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold gradient-text">
                  {store.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-2xl font-bold font-display mb-2">{store.display_name}</h1>
          {store.profile?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto">{store.profile.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {store.profile?.instagram_url && (
              <a
                href={store.profile.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {store.profile?.twitter_url && (
              <a
                href={store.profile.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {store.profile?.youtube_url && (
              <a
                href={store.profile.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {store.profile?.website && (
              <a
                href={store.profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "gradient-primary text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs ${activeTab === tab.id ? "text-white/80" : "text-muted-foreground"}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-8"
        >
          {/* Links Tab */}
          {activeTab === "links" && (
            <>
              {links.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No links added yet.</p>
              ) : (
                links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <GlassCard variant="hover" className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium flex-1">{link.title}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </GlassCard>
                  </a>
                ))
              )}
            </>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <>
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No products available.</p>
              ) : (
                products.map((product) => (
                  <GlassCard key={product.id} className="overflow-hidden">
                    {product.cover_image_url && (
                      <img
                        src={product.cover_image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover -m-4 mb-4"
                        style={{ width: "calc(100% + 2rem)" }}
                      />
                    )}
                    <h3 className="font-bold mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold gradient-text">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <GradientButton
                        size="sm"
                        onClick={() => handlePurchase(product.id, "digital")}
                        disabled={paymentLoading}
                      >
                        Buy Now
                      </GradientButton>
                    </div>
                  </GlassCard>
                ))
              )}
            </>
          )}

          {/* Memberships Tab */}
          {activeTab === "memberships" && (
            <>
              {memberships.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No memberships available.</p>
              ) : (
                memberships.map((membership) => (
                  <GlassCard key={membership.id} className="gradient-border">
                    <h3 className="font-bold mb-1">{membership.name}</h3>
                    {membership.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {membership.description}
                      </p>
                    )}
                    {membership.benefits && membership.benefits.length > 0 && (
                      <ul className="text-sm space-y-2 mb-4">
                        {membership.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold gradient-text">
                          {formatPrice(membership.price, membership.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/{membership.interval}</span>
                      </div>
                      <GradientButton
                        size="sm"
                        onClick={() => handlePurchase(membership.id, "membership")}
                        disabled={paymentLoading}
                      >
                        Subscribe
                      </GradientButton>
                    </div>
                  </GlassCard>
                ))
              )}
            </>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No booking options available.</p>
              ) : (
                bookings.map((booking) => (
                  <GlassCard key={booking.id}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{booking.name}</h3>
                        {booking.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {booking.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {booking.duration} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold gradient-text">
                        {formatPrice(booking.price, booking.currency)}
                      </span>
                      <GradientButton
                        size="sm"
                        onClick={() => handlePurchase(booking.id, "booking")}
                        disabled={paymentLoading}
                      >
                        Book Now
                      </GradientButton>
                    </div>
                  </GlassCard>
                ))
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StorePage;
