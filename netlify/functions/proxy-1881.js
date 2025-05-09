
/**
 * Netlify serverless function for proxying requests to 1881 API
 */

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Parse query parameters
  const params = new URLSearchParams(event.queryStringParameters);
  const number = params.get('number');
  const size = params.get('size') || '1';
  
  if (!number) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameter: number' }),
    };
  }
  
  try {
    // Normalize the phone number
    let formattedNumber = number.replace(/\D/g, '');
    
    // If the number is exactly 8 digits, add Norwegian country code
    if (formattedNumber.length === 8) {
      formattedNumber = '+47' + formattedNumber;
    } else if (formattedNumber.length === 10 && formattedNumber.startsWith('47')) {
      formattedNumber = '+' + formattedNumber;
    } else {
      // Add + prefix if missing
      if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
      }
    }
    
    // Use the correct 1881 API endpoint
    const url = `https://api.1881.no/search?phoneNumber=${encodeURIComponent(formattedNumber)}&size=${size}`;
    
    // Make the request with the proper Subscription Key header
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env._1881_API_KEY, // API key from environment variables
        'User-Agent': 'Mozilla/5.0 (Netlify Function)'
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`1881 API responded with ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    // Parse and return the data
    const data = await response.json();
    
    // Format the response to match the expected structure
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
    
    return {
      statusCode: 200,
      body: JSON.stringify(formattedData),
    };
  } catch (error) {
    console.error('Error proxying to 1881 API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch data from 1881 API',
        message: error.message,
      }),
    };
  }
};
