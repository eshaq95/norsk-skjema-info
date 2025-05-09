
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow both POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    let number;
    let size = '1';
    
    if (req.method === 'GET') {
      // Parse the URL to get the query parameters
      const url = new URL(req.url);
      number = url.searchParams.get('number');
      size = url.searchParams.get('size') || '1';
    } else {
      // Parse the request body for POST requests
      const requestData = await req.json();
      number = requestData.number;
      size = requestData.size || '1';
    }
    
    if (!number) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: number' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get('_1881_API_KEY');
    if (!apiKey) {
      console.error('_1881_API_KEY environment variable not set');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error', 
        message: 'API key not configured'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct the URL for the 1881 API
    const apiUrl = `https://app.1881.no/api/1/phone?number=${number}&size=${size}`;
    
    console.log(`Making request to 1881 API: ${apiUrl}`);
    console.log(`Using API key that starts with: ${apiKey.substring(0, 5)}...`);

    // Make the request with the proper Authorization header
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    console.log(`1881 API responded with status: ${response.status}`);
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`1881 API error response: ${errorText}`);
      
      return new Response(JSON.stringify({ 
        error: `1881 API responded with ${response.status}`, 
        message: errorText
      }), { 
        status: response.status === 401 ? 401 : 502, // Pass through 401 errors, use 502 for others
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse and return the data
    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in phone-lookup edge function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from 1881 API',
      message: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
