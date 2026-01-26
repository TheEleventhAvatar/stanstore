import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Animated background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-stan-purple/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-stan-pink/30 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stan-cyan/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/80 backdrop-blur-sm border border-border/50 mb-8"
          >
            <Sparkles className="w-4 h-4 text-stan-purple" />
            <span className="text-sm font-medium text-foreground">
              The #1 Link-in-Bio for Creators
            </span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight mb-6"
          >
            Turn Your{" "}
            <span className="gradient-text">Audience</span>
            <br />
            Into{" "}
            <span className="gradient-text">Revenue</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Sell digital products, memberships, and 1:1 bookings. 
            All from your own personalized store. No coding required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/signup">
              <GradientButton size="xl" variant="glow">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-1" />
              </GradientButton>
            </Link>
            <Link to="/login">
              <GradientButton size="xl" variant="outline">
                I Already Have an Account
              </GradientButton>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-stan-purple to-stan-pink border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-foreground">10,000+</span> creators already monetizing
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
              <span className="ml-1 text-sm font-medium">4.9/5</span>
            </div>
          </motion.div>
        </div>

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative max-w-4xl mx-auto"
        >
          {/* Glow behind the card */}
          <div className="absolute inset-0 bg-gradient-to-r from-stan-purple/20 to-stan-pink/20 rounded-3xl blur-3xl" />
          
          {/* Mock store preview */}
          <div className="relative glass rounded-3xl p-2 shadow-2xl">
            <div className="bg-gradient-to-br from-background to-secondary/50 rounded-2xl p-8">
              {/* Mock header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                  JD
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display">Jane Doe</h3>
                  <p className="text-muted-foreground">Content Creator & Coach</p>
                </div>
              </div>
              
              {/* Mock links/products */}
              <div className="grid gap-3">
                {["📚 My Digital Course - $49", "🎯 1:1 Coaching Call - $99", "💎 Premium Membership - $19/mo", "🔗 Follow me on Instagram"].map((item, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
                  >
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
