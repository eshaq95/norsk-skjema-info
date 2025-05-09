
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
    // Normalize the phone number for the API (E.164 without +)
    let formattedNumber = number.replace(/\D/g, '');
    
    // If the number is exactly 8 digits, add Norwegian country code
    if (formattedNumber.length === 8) {
      formattedNumber = '47' + formattedNumber;
    } else if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    // Use the correct 1881 API endpoint
    const url = `https://services.api1881.no/lookup/phonenumber/${formattedNumber}`;
    
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
