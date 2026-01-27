import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { productId, productType, customerId, storeId } = await req.json();

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get product details based on type
    let product;
    let tableName = "products";
    
    if (productType === "membership") {
      tableName = "memberships";
    } else if (productType === "booking") {
      tableName = "booking_types";
    }

    const { data: productData, error: productError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !productData) {
      throw new Error("Product not found");
    }

    product = productData;

    // Convert price to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(product.price * 100);

    // Create Razorpay order
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: product.currency?.toUpperCase() || "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          product_id: productId,
          product_type: productType,
          store_id: storeId,
          customer_id: customerId || null,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorData);
      throw new Error("Failed to create Razorpay order");
    }

    const orderData = await orderResponse.json();

    // Create pending order in database
    const platformFee = Math.round(product.price * 0.05 * 100) / 100; // 5% platform fee

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        amount: product.price,
        currency: product.currency || "INR",
        platform_fee: platformFee,
        status: "pending",
        store_id: storeId,
        customer_id: customerId || null,
        product_id: productType === "digital" ? productId : null,
        membership_id: productType === "membership" ? productId : null,
        booking_type_id: productType === "booking" ? productId : null,
        stripe_checkout_session_id: orderData.id, // Reusing field for Razorpay order ID
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order record");
    }

    console.log("Razorpay order created successfully:", orderData.id);

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: razorpayKeyId,
        dbOrderId: order.id,
        productName: product.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating Razorpay order:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
