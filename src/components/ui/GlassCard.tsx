import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "gradient" | "hover";
  glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300",
          {
            "bg-card/80 backdrop-blur-xl border border-border/50": variant === "default",
            "bg-background/40 backdrop-blur-xl border border-white/10": variant === "dark",
            "gradient-border bg-card": variant === "gradient",
            "bg-card/80 backdrop-blur-xl border border-border/50 hover:scale-[1.02] hover:shadow-xl cursor-pointer": variant === "hover",
          },
          glow && "glow-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
