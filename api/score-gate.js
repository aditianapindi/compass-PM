export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text, background } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const prompt = `You are a PM hiring expert scoring a candidate's first product teardown.

Candidate background: ${background || 'Not specified'}

The task asked them to pick any app feature and answer:
1. Who is this feature for?
2. What problem does it solve?
3. How would you know if it's working?
4. What would you change — and why?

Their response:
"${text}"

Score this and return ONLY a JSON object — no markdown, no explanation.

Schema:
{
  "score": <integer 0–100>,
  "thinkingStyle": "<one of: user-first | metric-first | solution-first | problem-first>",
  "headline": "<one punchy sentence max 12 words that captures how this person thinks>",
  "strength": "<one specific thing they did well, referencing their actual words>",
  "gap": "<one specific gap or reframe needed, referencing their actual words>"
}

Scoring guide:
- 80–100: Grounds in user + names real problem + proposes measurable change
- 60–79: Shows product instinct but one dimension is weak (no metric, vague user, etc.)
- 40–59: Leads with solution or feature opinion before diagnosing the problem
- 0–39: Too generic or vague to signal PM readiness

Be ruthlessly specific to their actual words. Do not give generic PM feedback.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 }
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(200).json({ error: data.error.message });
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!content) return res.status(200).json({ error: 'Empty response' });
    try {
      return res.status(200).json(JSON.parse(content));
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { return res.status(200).json(JSON.parse(match[0])); } catch {}
      }
      return res.status(200).json({ error: 'Could not parse response' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
