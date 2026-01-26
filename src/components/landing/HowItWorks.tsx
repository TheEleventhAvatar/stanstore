import { motion } from "framer-motion";
import { UserPlus, Palette, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Account",
    description: "Sign up in seconds with your email or Google account. No credit card required to start.",
  },
  {
    icon: Palette,
    number: "02", 
    title: "Customize Your Store",
    description: "Add your products, links, and branding. Choose from beautiful templates or create your own style.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Start Earning",
    description: "Share your store link and start accepting payments. Money goes directly to your bank account.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary/30" id="how-it-works">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
            Launch in <span className="gradient-text">Minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your store up and running in three simple steps. 
            No technical skills needed.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-stan-purple/50 to-stan-pink/50" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl gradient-primary mb-6 relative">
                  <step.icon className="w-10 h-10 text-white" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold font-display mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
