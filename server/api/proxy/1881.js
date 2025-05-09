
/**
 * Server-side proxy for 1881 API to avoid CORS issues
 * 
 * This file should be adapted based on your server framework (Express, Next.js, etc.)
 * The example below is for a generic Express/Node.js setup
 */

// Example using Express.js
export default async function handler(req, res) {
  // Get the query parameters
  const { number, size = 1 } = req.query;
  
  if (!number) {
    return res.status(400).json({ error: 'Missing required parameter: number' });
  }
  
  try {
    // Normalize the phone number - ensure it starts with +47 if it's 8 digits
    let formattedNumber = number;
    if (number.length === 8 && !number.startsWith('+47')) {
      formattedNumber = '+47' + number;
    } else if (number.length === 10 && number.startsWith('47')) {
      formattedNumber = '+' + number;
    }
    
    // Use the correct API endpoint for the new 1881 Search API
    const url = `https://api.1881.no/search?phoneNumber=${encodeURIComponent(formattedNumber)}&size=${size}`;
    
    // Make the request with the proper Subscription Key header
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env._1881_API_KEY, // API key from environment variables
        'User-Agent': 'Mozilla/5.0' // Standard User-Agent
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`1881 API responded with ${response.status}: ${response.statusText}`);
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
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error proxying to 1881 API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from 1881 API',
      message: error.message 
    });
  }
}
