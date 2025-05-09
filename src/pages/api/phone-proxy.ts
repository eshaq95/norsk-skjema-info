
export default async (req: any, res: any) => {
  const { num } = req.query;
  if (!num) return res.status(400).json({ error: 'Missing num' });

  try {
    const r = await fetch(
      `https://app.1881.no/api/1/phone?number=${num}&size=1`,
      { headers: { Authorization: `Bearer ${process.env.TOKEN_1881}` } }
    );

    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from frontend
    res.status(r.status).json(data);
  } catch (error) {
    console.error('Error in phone proxy:', error);
    res.status(500).json({ error: 'Failed to fetch phone data' });
  }
}
