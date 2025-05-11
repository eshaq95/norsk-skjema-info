
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ChargeBee from "npm:chargebee";

// Configure ChargeBee with environment variables
ChargeBee.configure({
  site: Deno.env.get("CB_SITE")!,     // e.g. nordicmelatonin-test
  api_key: Deno.env.get("CB_API_KEY")! // secret key
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { orderId, priceNok, customer } = await req.json();
    
    console.log(`Creating Chargebee Hosted Page for order: ${orderId}`);
    
    const result = await ChargeBee.hosted_page.checkout_new({
      subscription: { plan_id: "melatonin-1pk" },  // or item_price_id
      customer, // name, email, etc.
      redirect_url: `${Deno.env.get("FRONTEND_URL")}/cb-success?order=${orderId}`,
      cancel_url: `${Deno.env.get("FRONTEND_URL")}/cancel`
    }).request();
    
    console.log(`Chargebee Hosted Page created successfully: ${result.hosted_page.url}`);
    
    return new Response(
      JSON.stringify({ url: result.hosted_page.url }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error creating Chargebee hosted page:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
