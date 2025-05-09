
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
    // Construct the URL for the 1881 API
    const url = `https://app.1881.no/api/1/phone?number=${number}&size=${size}`;
    
    // Make the request with the proper Authorization header
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env._1881_API_KEY}`, // API key from environment variables
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`1881 API responded with ${response.status}: ${response.statusText}`);
    }
    
    // Parse and return the data
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
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
