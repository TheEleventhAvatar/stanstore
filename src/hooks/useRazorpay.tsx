import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreateOrderParams {
  productId: string;
  productType: "digital" | "membership" | "booking";
  storeId: string;
  customerId?: string;
}

interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please refresh and try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);
  }, [toast]);

  const initiatePayment = useCallback(
    async (params: CreateOrderParams): Promise<PaymentResult> => {
      if (!isScriptLoaded) {
        return { success: false, error: "Payment gateway not loaded" };
      }

      setIsLoading(true);

      try {
        // Create Razorpay order
        const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
          body: params,
        });

        if (error || !data) {
          throw new Error(error?.message || "Failed to create order");
        }

        const { orderId, amount, currency, keyId, dbOrderId, productName } = data;

        return new Promise((resolve) => {
          const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: "Stan Store",
            description: productName,
            order_id: orderId,
            handler: async (response: any) => {
              try {
                // Verify payment
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                  "razorpay-verify-payment",
                  {
                    body: {
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature,
                      dbOrderId: dbOrderId,
                    },
                  }
                );

                if (verifyError) {
                  throw verifyError;
                }

                setIsLoading(false);
                toast({
                  title: "Payment Successful!",
                  description: "Your purchase has been completed.",
                });
                resolve({ success: true, orderId: dbOrderId });
              } catch (err: any) {
                setIsLoading(false);
                toast({
                  title: "Payment Verification Failed",
                  description: err.message,
                  variant: "destructive",
                });
                resolve({ success: false, error: err.message });
              }
            },
            modal: {
              ondismiss: () => {
                setIsLoading(false);
                resolve({ success: false, error: "Payment cancelled" });
              },
            },
            prefill: {},
            theme: {
              color: "#8B5CF6",
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.on("payment.failed", (response: any) => {
            setIsLoading(false);
            toast({
              title: "Payment Failed",
              description: response.error.description,
              variant: "destructive",
            });
            resolve({ success: false, error: response.error.description });
          });
          razorpay.open();
        });
      } catch (err: any) {
        setIsLoading(false);
        toast({
          title: "Payment Error",
          description: err.message,
          variant: "destructive",
        });
        return { success: false, error: err.message };
      }
    },
    [isScriptLoaded, toast]
  );

  return {
    initiatePayment,
    isLoading,
    isReady: isScriptLoaded,
  };
};
