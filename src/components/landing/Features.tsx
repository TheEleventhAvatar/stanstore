import { motion } from "framer-motion";
import { 
  Link2, 
  ShoppingBag, 
  Users, 
  Calendar, 
  BarChart3, 
  CreditCard,
  Palette,
  Zap,
  Shield
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Link2,
    title: "Link-in-Bio",
    description: "One beautiful page with all your links, products, and content. Perfect for social media.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: ShoppingBag,
    title: "Digital Products",
    description: "Sell courses, ebooks, templates, presets, and any digital file instantly.",
    color: "from-pink-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Memberships",
    description: "Build recurring revenue with subscription tiers and exclusive member content.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Calendar,
    title: "1:1 Bookings",
    description: "Let fans book coaching calls, consultations, or meetings directly.",
    color: "from-yellow-500 to-green-500",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track visitors, sales, and revenue with beautiful real-time dashboards.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: CreditCard,
    title: "Instant Payouts",
    description: "Get paid directly to your bank account. No waiting, no hassle.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description: "Match your store to your brand with custom colors, fonts, and themes.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed. Your page loads instantly on any device.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-level security for payments. Your data is always protected.",
    color: "from-indigo-500 to-purple-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="features">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-stan-purple/10 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Monetize</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All the tools to sell digital products, run memberships, and book calls — 
            beautifully integrated in one platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <GlassCard variant="hover" className="h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
