import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const testimonials = [
  {
    name: "Sarah Johnson",
    handle: "@sarahcreates",
    avatar: "SJ",
    role: "Fitness Coach",
    content: "I made $5,000 in my first month selling workout plans. This platform is a game-changer for creators!",
    revenue: "$47K+ earned",
  },
  {
    name: "Mike Chen",
    handle: "@mikedesigns",
    avatar: "MC",
    role: "UI/UX Designer",
    content: "Finally, a platform that doesn't take 30% of my sales. The membership feature is incredibly powerful.",
    revenue: "$23K+ earned",
  },
  {
    name: "Emily Rose",
    handle: "@emilycoaches",
    avatar: "ER",
    role: "Business Coach",
    content: "The booking system is seamless. My clients love how easy it is to schedule 1:1 calls with me.",
    revenue: "$89K+ earned",
  },
  {
    name: "David Park",
    handle: "@davidteaches",
    avatar: "DP",
    role: "Course Creator",
    content: "Switched from Gumroad and never looked back. Better features, lower fees, beautiful design.",
    revenue: "$156K+ earned",
  },
  {
    name: "Lisa Wang",
    handle: "@lisawrites",
    avatar: "LW",
    role: "Content Writer",
    content: "The analytics dashboard helps me understand exactly what my audience wants. Sales doubled!",
    revenue: "$34K+ earned",
  },
  {
    name: "James Miller",
    handle: "@jamesphoto",
    avatar: "JM",
    role: "Photographer",
    content: "Selling presets and courses from one link-in-bio has simplified my entire business. Highly recommend!",
    revenue: "$67K+ earned",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-stan-pink/10 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
            Loved by <span className="gradient-text">Creators</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators who are building their businesses and 
            earning a living doing what they love.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <GlassCard className="h-full relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/20" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-500">{testimonial.revenue}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
