import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Store, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  displayName: z.string().min(2, "Store name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(30, "URL must be less than 30 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
  description: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      subdomain: "",
      description: "",
    },
  });

  const checkSubdomain = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const { data } = await supabase
        .from("stores")
        .select("id")
        .eq("subdomain", subdomain)
        .single();

      setSubdomainAvailable(!data);
    } catch {
      setSubdomainAvailable(true);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      // First get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create the store
      const { error: storeError } = await supabase.from("stores").insert({
        user_id: user.id,
        profile_id: profile.id,
        subdomain: data.subdomain,
        display_name: data.displayName,
        description: data.description || null,
        is_published: false,
      });

      if (storeError) {
        if (storeError.message.includes("duplicate")) {
          toast({
            title: "URL already taken",
            description: "Please choose a different URL for your store",
            variant: "destructive",
          });
          return;
        }
        throw storeError;
      }

      toast({
        title: "Store created!",
        description: "Welcome to your new store. Let's start customizing!",
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create your store. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-stan-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-stan-pink/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display">Set up your store</h1>
          <p className="mt-2 text-muted-foreground">
            Let's create your personalized store in seconds
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="My Awesome Store"
                        className="h-12"
                      />
                    </FormControl>
                    <FormDescription>
                      This is how your store will appear to visitors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          {...field}
                          placeholder="mystore"
                          className="h-12 rounded-r-none"
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                            field.onChange(value);
                            checkSubdomain(value);
                          }}
                        />
                        <div className="h-12 px-4 flex items-center bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground text-sm">
                          .stan.store
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="flex items-center gap-2">
                      {isCheckingSubdomain ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Checking availability...
                        </>
                      ) : subdomainAvailable === true ? (
                        <span className="text-green-500">✓ URL is available!</span>
                      ) : subdomainAvailable === false ? (
                        <span className="text-destructive">✗ URL is already taken</span>
                      ) : (
                        "Choose a unique URL for your store"
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell visitors what you do..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <GradientButton
                type="submit"
                className="w-full h-12"
                disabled={isLoading || subdomainAvailable === false}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create my store
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </GradientButton>
            </form>
          </Form>
        </div>

        {/* Skip link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Want to explore first?{" "}
          <Link to="/dashboard" className="text-primary hover:underline">
            Skip for now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
