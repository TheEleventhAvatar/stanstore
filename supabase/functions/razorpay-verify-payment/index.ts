import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = await req.json();

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const key = new TextEncoder().encode(razorpayKeySecret);
    const message = new TextEncoder().encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature verification failed");
      throw new Error("Payment verification failed - invalid signature");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        stripe_payment_intent_id: razorpayPaymentId, // Reusing field for Razorpay payment ID
      })
      .eq("id", dbOrderId)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      throw new Error("Failed to update order status");
    }

    // If it's a product, increment sales count
    if (order.product_id) {
      await supabase.rpc("increment_sales_count", { product_id: order.product_id });
    }

    // If it's a membership, create subscription record
    if (order.membership_id && order.customer_id) {
      await supabase.from("subscriptions").insert({
        customer_id: order.customer_id,
        membership_id: order.membership_id,
        store_id: order.store_id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
    }

    console.log("Payment verified successfully:", razorpayPaymentId);

    return new Response(
      JSON.stringify({ success: true, order }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error verifying payment:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
