
/**
 * Next.js API route for proxying requests to 1881 API
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the query parameters
  const { number, size = 1 } = req.query;
  
  if (!number) {
    return res.status(400).json({ error: 'Missing required parameter: number' });
  }
  
  try {
    // Update the URL to the correct 1881 API endpoint
    const url = `https://www.1881.no/api/1/phone?number=${number}&size=${size}`;
    
    // Make the request with the proper Authorization header
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env._1881_API_KEY}`, // API key from environment variables
        'User-Agent': 'Mozilla/5.0' // Standard User-Agent
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`1881 API responded with ${response.status}: ${response.statusText}`);
    }
    
    // Parse and return the data
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to 1881 API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from 1881 API',
      message: error.message 
    });
  }
}
