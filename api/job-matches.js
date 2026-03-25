import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { background, targetCompany, resumeData, readinessScores, gateScore } = req.body;

  // Load curated market data
  let marketData = {};
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
    marketData = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load market data:', e.message);
  }

  // Retrieve relevant companies — target company + best matches for background
  const companies = marketData.companies || [];
  const targetMatch = companies.find(c => c.name.toLowerCase() === (targetCompany || '').toLowerCase());
  const otherCompanies = companies.filter(c => c !== targetMatch).slice(0, 6);
  const relevantCompanies = targetMatch ? [targetMatch, ...otherCompanies] : otherCompanies.slice(0, 7);

  // Find transition intelligence for user's background
  const transitions = marketData.transitionIntelligence?.successRateByBackground || [];
  const bgMatch = transitions.find(t => (background || '').toLowerCase().includes(t.background.toLowerCase()));

  const prompt = `You are Compass's job matching engine for aspiring Product Managers in India.

Given this user's profile AND the real company hiring data below, generate 4 PM job matches. Base your fit scores and gap notes on the ACTUAL hiring bar data provided — do not invent numbers.

## Real Company Hiring Data (from Compass database)
${relevantCompanies.map(c => `
**${c.name}** (${c.stage} · ${c.vertical} · ${c.city})
- Roles: ${c.topRoles.join(', ')}
- Annual PM intake: ${c.annualJuniorPMIntake}
- Hiring bar: Product Sense ${c.hiringBar.productSense}, Analytical ${c.hiringBar.analyticalDepth}, Business ${c.hiringBar.businessFraming}, Technical ${c.hiringBar.technicalCredibility}, AI ${c.hiringBar.aiFluency}, Behavioural ${c.hiringBar.behavioural}
- Interview: ${c.interviewFormat.join(' → ')} (${c.interviewRounds} rounds)
- Switcher-friendly: ${c.switcherFriendly ? 'Yes — ' + c.switcherNote : 'No — ' + c.switcherNote}
- Common rejections: ${c.commonRejectionReasons.join('; ')}
- Recent signals: ${c.recentSignals.join('; ')}
- Salary: ${c.salaryRange}`).join('\n')}

${bgMatch ? `\n## Transition Intelligence for ${bgMatch.background}s\n- Conversion rate: ${bgMatch.conversionRate}\n- Avg time to offer: ${bgMatch.avgTimeToOffer}\n- Best fit companies: ${bgMatch.bestFitCompanies.join(', ')}\n- Note: ${bgMatch.note}` : ''}

## User Profile
Background: ${background || 'Not provided'}
Target company: ${targetCompany || 'Not specified'}
Current role: ${resumeData?.currentRole || 'Not provided'}
Experience: ${resumeData?.totalExperience || 'Not provided'}
Skills: ${resumeData?.skills ? resumeData.skills.join(', ') : 'Not provided'}

Readiness scores:
${readinessScores?.dimensions ? readinessScores.dimensions.map(d => `${d.name}: ${d.score}/100 (${d.status})`).join('\n') : 'Not yet scored'}

Gate task:
${gateScore ? `Score: ${gateScore.score}/100 — ${gateScore.headline}` : 'Not completed'}

## Fit Score Rules
- Compare user's readiness scores against the company's hiring bar for each dimension
- Fit % = how many dimensions meet or exceed the hiring bar, weighted by the company's priority dimensions
- If user score is below company bar on 2+ priority dimensions → fit should be under 65%
- Use the transition intelligence to adjust: if this background type converts well at this company, boost fit by 5–10%
- Be specific in gapNote: reference actual dimensions and company-specific context

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "jobs": [
    {
      "title": "<PM role title — max 4 words>",
      "company": "<company name>",
      "stage": "<stage>",
      "vertical": "<vertical>",
      "city": "<city>",
      "fit": <number 0-100>,
      "isTarget": <true/false>,
      "gapCount": <number>,
      "gapNote": "<specific note referencing dimensions and timeline>",
      "salary": "<salary range>",
      "interviewRounds": <number>
    }
  ]
}

Return exactly 4 jobs. Put the target company job FIRST. Sort remaining 3 by fit descending.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 1000, thinkingConfig: { thinkingBudget: 0 } } };

  try {
    const data = await geminiWithRetry(url, body);
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

async function geminiWithRetry(url, body, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await resp.json();
      if (data.error && i < retries) { await new Promise(r => setTimeout(r, 1000 * (i + 1))); continue; }
      return data;
    } catch (e) { if (i === retries) throw e; await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
}
