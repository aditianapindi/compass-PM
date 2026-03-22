export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const prompt = `Extract information from this resume. Return ONLY a JSON object, nothing else.

Required format:
{"name":"string or null","email":"string or null","phone":"string or null","experience":["string"...],"awards":["string"...]}

Resume:
${text.slice(0, 4000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.0,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try direct parse first
    try {
      return res.status(200).json(JSON.parse(content));
    } catch {
      // Extract JSON object from anywhere in the string
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return res.status(200).json(JSON.parse(match[0]));
        } catch {}
      }
      return res.status(200).json({ error: 'Could not parse response', raw: content.slice(0, 300) });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
