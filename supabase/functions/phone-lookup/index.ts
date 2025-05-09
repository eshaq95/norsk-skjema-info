
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

    // Normalize the phone number for the API
    // Remove all non-digit characters
    let formattedNumber = number.replace(/\D/g, '');
    
    // Ensure the phone number has the correct format for the API (E.164 without +)
    // For Norwegian numbers: if 8 digits, add 47 prefix
    if (formattedNumber.length === 8) {
      formattedNumber = '47' + formattedNumber;
    } else if (formattedNumber.startsWith('+')) {
      // If there's a + sign, remove it
      formattedNumber = formattedNumber.substring(1);
    }
    
    console.log(`Attempting to look up phone number: ${formattedNumber}`);
    
    try {
      // Use the correct 1881 API endpoint
      const apiUrl = `https://services.api1881.no/lookup/phonenumber/${formattedNumber}`;
      console.log(`Making request to 1881 API: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': apiKey,
          'User-Agent': 'Mozilla/5.0 (Supabase Edge Function)'
        },
      });
      
      console.log(`1881 API responded with status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`1881 API responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the response to match the expected structure
      const formattedData = {
        content: data.contacts && data.contacts.length > 0 
          ? data.contacts.map(contact => ({
              id: contact.id || '',
              name: contact.name || '',
              address: contact.address ? contact.address.street || '' : '',
              postnr: contact.address ? contact.address.postCode || '' : '',
              poststed: contact.address ? contact.address.postArea || '' : '',
            }))
          : [],
        hasMore: false // The API doesn't return a hasMore property
      };
      
      return new Response(JSON.stringify(formattedData), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (apiError) {
      console.error('Error accessing 1881 API:', apiError);
      
      // When the real API fails, return a fallback empty response
      return new Response(JSON.stringify({
        content: [],
        hasMore: false,
        _fallback: true,
        _message: "Could not connect to 1881 API. Service may be temporarily unavailable."
      }), { 
        status: 200, // Return 200 with empty content instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in phone-lookup edge function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      message: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
