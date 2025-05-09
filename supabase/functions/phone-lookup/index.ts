
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

    // Normalize the phone number - ensure it starts with +47 if it's 8 digits
    let formattedNumber = number;
    if (number.length === 8 && !number.startsWith('+47')) {
      formattedNumber = '+47' + number;
    } else if (number.length === 10 && number.startsWith('47')) {
      formattedNumber = '+' + number;
    }
    
    // Use the correct API endpoint and format for the new 1881 Search API
    const apiUrl = `https://api.1881.no/search?phoneNumber=${encodeURIComponent(formattedNumber)}&size=${size}`;
    
    console.log(`Making request to 1881 API: ${apiUrl}`);
    
    // Make the request with the proper Subscription Key header
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey, // Using subscription key header for this API
        'User-Agent': 'Mozilla/5.0 (Supabase Edge Function)'
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
    
    // Format the response to match the expected structure in phoneUtils.ts
    const formattedData = {
      content: data.hits && data.hits.length > 0 
        ? data.hits.map(hit => ({
            id: hit.id || '',
            name: hit.name || '',
            address: hit.address ? hit.address.street || '' : '',
            postnr: hit.address ? hit.address.postCode || '' : '',
            poststed: hit.address ? hit.address.postArea || '' : '',
          }))
        : [],
      hasMore: data.hasMore || false
    };
    
    return new Response(JSON.stringify(formattedData), { 
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
