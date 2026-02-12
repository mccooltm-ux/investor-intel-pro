export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('sec.gov')) {
      return res.status(400).json({ error: 'Only sec.gov URLs are allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AnalystHub InvestorIntelPro/1.0 ted@analysthub.com',
        'Accept': 'application/json, text/xml, text/html, */*',
      }
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(response.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'SEC fetch failed', detail: e.message });
  }
}
