
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as crypto from "https://deno.land/std@0.168.0/node/crypto.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SECRET = Deno.env.get("CB_WEBHOOK_SECRET")!;  // Set in Chargebee UI
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const raw = await req.text();
    const sig = req.headers.get("chargebee-event-signature");
    
    if (!sig) {
      console.error("Missing Chargebee event signature");
      return new Response("Unauthorized", { status: 401 });
    }
    
    // Verify signature
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(raw);
    const hash = hmac.digest("hex");
    
    if (hash !== sig) {
      console.error("Invalid Chargebee signature");
      return new Response("Bad signature", { status: 400 });
    }
    
    const event = JSON.parse(raw);
    console.log(`Processing Chargebee event: ${event.event_type}`);
    
    if (
      event.event_type === "payment_succeeded" ||
      event.event_type === "hosted_page_payment_succeeded"
    ) {
      // Extract the order ID from the hosted page reference
      const orderId = event.content.hosted_page?.client_reference_id;
      
      if (orderId) {
        console.log(`Updating order ${orderId} status to paid`);
        
        // Update order status in Supabase
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);
        
        if (error) {
          console.error(`Failed to update order ${orderId}:`, error);
          return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        console.log(`Successfully updated order ${orderId} status to paid`);
      } else {
        console.warn("No order ID found in webhook payload");
      }
    }
    
    return new Response("OK", { status: 200 });
    
  } catch (error) {
    console.error("Error processing Chargebee webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
