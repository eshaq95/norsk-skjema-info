
export default async (req: any, res: any) => {
  const { num } = req.query;
  if (!num) return res.status(400).json({ error: 'Missing num' });

  try {
    // Normalize the phone number - ensure it starts with +47 if it's 8 digits
    let formattedNumber = num;
    if (num.length === 8 && !num.startsWith('+47')) {
      formattedNumber = '+47' + num;
    } else if (num.length === 10 && num.startsWith('47')) {
      formattedNumber = '+' + num;
    }
    
    // Use the correct 1881 API endpoint
    const r = await fetch(
      `https://api.1881.no/search?phoneNumber=${encodeURIComponent(formattedNumber)}&size=1`,
      { headers: { 'Ocp-Apim-Subscription-Key': process.env.TOKEN_1881, 'Accept': 'application/json' } }
    );

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
    
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from frontend
    res.status(r.status).json(formattedData);
  } catch (error) {
    console.error('Error in phone proxy:', error);
    res.status(500).json({ error: 'Failed to fetch phone data' });
  }
}
