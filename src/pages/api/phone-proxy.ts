
export default async (req: any, res: any) => {
  const { num } = req.query;
  if (!num) return res.status(400).json({ error: 'Missing num' });

  try {
    // Normalize the phone number
    let formattedNumber = num.replace(/\D/g, '');
    
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
    const r = await fetch(
      `https://api.1881.no/search?phoneNumber=${encodeURIComponent(formattedNumber)}&size=1`,
      { 
        headers: { 
          'Ocp-Apim-Subscription-Key': process.env._1881_API_KEY || '', 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Node.js)'
        } 
      }
    );

    if (!r.ok) {
      throw new Error(`1881 API error response: ${await r.text()}`);
    }

    const data = await r.json();
    
    // Format the response to match the expected structure
    const formattedData = {
      content: data.hits && data.hits.length > 0 
        ? data.hits.map((hit: any) => ({
            id: hit.id || '',
            name: hit.name || '',
            address: hit.address ? hit.address.street || '' : '',
            postnr: hit.address ? hit.address.postCode || '' : '',
            poststed: hit.address ? hit.address.postArea || '' : '',
          }))
        : [],
      hasMore: data.hasMore || false
    };
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(formattedData);
  } catch (error: any) {
    console.error('Error in phone proxy:', error);
    res.status(500).json({ 
      error: 'Failed to fetch phone data',
      message: error.message 
    });
  }
}
