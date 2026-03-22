export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const prompt = `Extract information from this resume. Return ONLY a JSON object, nothing else. No markdown, no explanation.

{"name":"full name","email":"email or null","phone":"phone or null","experience":["role at company (dates)"],"awards":["award name"]}

Resume:
${text.slice(0, 3000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.0 }
        })
      }
    );

    const data = await response.json();

    // Log full response for debugging
    console.log('Gemini full response:', JSON.stringify(data).slice(0, 500));

    // Check for API error
    if (data.error) {
      return res.status(200).json({ error: data.error.message });
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!content) {
      const reason = data.candidates?.[0]?.finishReason || 'unknown';
      return res.status(200).json({ error: `Empty response from Gemini. Reason: ${reason}`, fullResponse: JSON.stringify(data).slice(0, 300) });
    }

    // Try direct parse
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
