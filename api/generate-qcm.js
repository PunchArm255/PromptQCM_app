export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const OOBABOOGA_API_URL = 'https://text-generation-webui.kenjibailly.com/v1/completions';
  const OOBABOOGA_API_KEY = process.env.OOBABOOGA_API_KEY;
  if (!OOBABOOGA_API_KEY) {
    return res.status(500).json({ error: 'OOBABOOGA_API_KEY environment variable not set' });
  }

  try {
    const response = await fetch(OOBABOOGA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OOBABOOGA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'oobabooga API error', details: error });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
} 