import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { background, targetCompany, readinessScores } = req.body;

  // Load curated market data
  let marketData = {};
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
    marketData = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load market data:', e.message);
  }

  const companies = marketData.companies || [];
  const trends = marketData.marketTrends || [];
  const targetMatch = companies.find(c => c.name.toLowerCase() === (targetCompany || '').toLowerCase());

  // Find user's weakest dimensions
  const gaps = (readinessScores?.dimensions || [])
    .filter(d => d.score < 60)
    .map(d => d.name)
    .join(', ');

  const prompt = `You are Compass's market intelligence engine. Generate 4 personalized hiring trend signals for this aspiring PM.

## Real Market Trend Data (from Compass database)
${trends.map(t => `- [${t.impact.toUpperCase()}] ${t.trend}: ${t.detail} (Source: ${t.source})`).join('\n')}

## Target Company Intelligence
${targetMatch ? `${targetMatch.name} (${targetMatch.stage} · ${targetMatch.vertical} · ${targetMatch.city})
- Recent signals: ${targetMatch.recentSignals.join('; ')}
- Hiring: ${targetMatch.annualJuniorPMIntake} junior PMs/year
- Top roles: ${targetMatch.topRoles.join(', ')}
- Switcher-friendly: ${targetMatch.switcherFriendly ? 'Yes' : 'No'}` : 'No specific target company data available'}

## User Context
Background: ${background || 'Not provided'}
Target company: ${targetCompany || 'Not specified'}
Dimension gaps: ${gaps || 'None identified'}

## Rules
- Each signal must reference REAL data from the database above — do not invent statistics
- Make signals personally relevant to THIS user's background, target company, and gaps
- Assign each signal an impact level: positive (good for user), warning (action needed), neutral (informational), negative (risk)
- Keep each signal to 1–2 sentences max
- Reference specific companies, numbers, and dimensions from the data

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "signals": [
    { "text": "<signal text with <strong> tags for key numbers/companies>", "impact": "<positive|warning|neutral|negative>" }
  ]
}

Return exactly 4 signals.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(200).json({ error: data.error.message });
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) return res.status(200).json({ error: 'Empty response' });

    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
