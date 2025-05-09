
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
    // Normalize the phone number - format for the API (E.164 without +)
    let formattedNumber = number.replace(/\D/g, '');
    
    // If the number is exactly 8 digits, add Norwegian country code
    if (formattedNumber.length === 8) {
      formattedNumber = '47' + formattedNumber;
    } else if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    // Use the correct API endpoint for the 1881 Lookup API
    const url = `https://services.api1881.no/lookup/phonenumber/${formattedNumber}`;
    
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
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error proxying to 1881 API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from 1881 API',
      message: error.message 
    });
  }
}
