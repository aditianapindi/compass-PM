export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const prompt = `You are a PM hiring expert. Analyse this resume and return ONLY a JSON object — no markdown, no explanation.

Schema:
{
  "name": "full name",
  "email": "email or null",
  "phone": "phone or null",
  "currentRole": "Most recent job title at Company (e.g. Senior Engineer at Infosys)",
  "totalExperience": "Total years of work experience as a string (e.g. '6 years')",
  "experience": ["Job Title at Company (start–end)", ... up to 5 most recent],
  "awards": ["award or recognition", ... up to 3],
  "pmHighlights": [
    {
      "text": "One specific observation about a PM-relevant signal in this resume",
      "type": "strength OR warning OR action",
      "label": "↑ Brief label (for strength) OR ⚠ Brief label (for warning) OR → Brief label (for action)"
    },
    ... exactly 4 items
  ],
  "skills": ["skill1", "skill2", ... up to 8 most relevant skills]
}

Rules for pmHighlights:
- strength = something that signals PM readiness (cross-functional work, impact metrics, ownership, shipping things)
- warning = something that may need reframing in a PM interview (service company vs product company, no metrics, etc.)
- action = something missing that they should build (proof of work, product writing, user research, etc.)
- Be specific to THIS resume, not generic

Resume:
${text.slice(0, 4000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ error: data.error.message });
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!content) {
      const reason = data.candidates?.[0]?.finishReason || 'unknown';
      return res.status(200).json({ error: `Empty response. Reason: ${reason}` });
    }

    // Try direct parse, then extract JSON block
    try {
      return res.status(200).json(JSON.parse(content));
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { return res.status(200).json(JSON.parse(match[0])); } catch {}
      }
      return res.status(200).json({ error: 'Could not parse response', raw: content.slice(0, 300) });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
