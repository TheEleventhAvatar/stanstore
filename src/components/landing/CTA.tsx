import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";

const benefits = [
  "No credit card required",
  "Free forever plan available",
  "Set up in under 5 minutes",
  "Cancel anytime",
];

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-10 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)/0.8)_0%,transparent_50%,hsl(var(--background)/0.8)_100%)] -z-10" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-stan-purple/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-stan-pink/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="container px-4 mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-6">
            Ready to Start <span className="gradient-text">Earning</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who have already transformed their passion into profit. 
            Your audience is waiting.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <Link to="/signup">
            <GradientButton size="xl" variant="glow" className="shadow-2xl">
              Create Your Free Store
              <ArrowRight className="w-5 h-5 ml-1" />
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
