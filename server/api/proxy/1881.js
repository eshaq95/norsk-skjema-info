
/**
 * Server-side proxy for 1881 API to avoid CORS issues
 * 
 * This file should be adapted based on your server framework (Express, Next.js, etc.)
 * The example below is for a generic Express/Node.js setup
 */

export default async function handler(req, res) {
  // Get the query parameters
  const { number, size = 1 } = req.query;
  
  if (!number) {
    return res.status(400).json({ error: 'Missing required parameter: number' });
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
        'User-Agent': 'Mozilla/5.0 (Server API)'
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
