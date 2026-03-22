export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { background, targetCompany, resumeData, gateScore } = req.body;
  if (!background && !resumeData && !gateScore) {
    return res.status(400).json({ error: 'No user data provided' });
  }

  const prompt = `You are a PM readiness assessor for Compass, a career navigation platform.

Score this user across 6 PM dimensions on a 0–100 scale. Be honest and calibrated — most aspiring PMs score 30–65. Only give 80+ for genuinely strong evidence.

## The 6 Dimensions
1. **Product Sense** — user empathy, problem framing, feature thinking, prioritisation
2. **Analytical Depth** — metric reasoning, data-driven decisions, quantitative rigour
3. **Business Framing** — commercial awareness, market thinking, revenue/growth framing
4. **Technical Credibility** — engineering background, system understanding, technical communication
5. **AI Fluency** — understanding of AI/ML concepts, AI product thinking, applied AI experience
6. **Behavioural** — leadership stories, collaboration, conflict resolution, PM-framed delivery

## Scoring Guide
- 0–30: No evidence or very weak
- 31–50: Early signals, significant gaps
- 51–65: Developing, has foundations but needs targeted work
- 66–80: Solid, above average for aspiring PMs
- 81–100: Exceptional, clear evidence of strength (rare for career switchers)

## User Data
Background: ${background || 'Not provided'}
Target company: ${targetCompany || 'Not specified'}

Resume data:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'No resume uploaded'}

Gate task result:
${gateScore ? `Score: ${gateScore.score}/100\nHeadline: ${gateScore.headline}\nStrength: ${gateScore.strength}\nGap: ${gateScore.gap}` : 'No gate task completed'}

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "dimensions": [
    { "name": "Product Sense", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence — specific to this user, referencing their actual data>" },
    { "name": "Analytical Depth", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence>" },
    { "name": "Business Framing", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence>" },
    { "name": "Technical Credibility", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence>" },
    { "name": "AI Fluency", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence>" },
    { "name": "Behavioural", "score": <number>, "status": "<Gap|Developing|Solid|Strong>", "note": "<one sentence>" }
  ],
  "overall": <number — weighted average>,
  "headline": "<one sentence summary of their PM readiness>"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1000, thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(200).json({ error: data.error.message });
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) return res.status(200).json({ error: 'Empty response' });

    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
