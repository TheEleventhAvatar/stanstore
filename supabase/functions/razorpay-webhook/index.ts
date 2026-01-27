import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const key = new TextEncoder().encode(secret);
  const message = new TextEncoder().encode(body);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const expectedSignature = await crypto.subtle.sign("HMAC", cryptoKey, message);
  const expectedSigHex = Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSigHex === signature;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Received webhook event:", event.event);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        // Find and update the order
        const { data: order, error } = await supabase
          .from("orders")
          .update({ 
            status: "completed",
            stripe_payment_intent_id: payment.id 
          })
          .eq("stripe_checkout_session_id", orderId)
          .select()
          .single();

        if (error) {
          console.error("Error updating order:", error);
        } else {
          console.log("Order marked as completed:", order.id);

          // Handle membership subscription creation
          if (order.membership_id && order.customer_id) {
            await supabase.from("subscriptions").insert({
              customer_id: order.customer_id,
              membership_id: order.membership_id,
              store_id: order.store_id,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("stripe_checkout_session_id", orderId);

        console.log("Order marked as failed for Razorpay order:", orderId);
        break;
      }

      case "refund.created": {
        const refund = event.payload.refund.entity;
        const paymentId = refund.payment_id;

        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentId);

        console.log("Order marked as refunded for payment:", paymentId);
        break;
      }

      default:
        console.log("Unhandled event type:", event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
