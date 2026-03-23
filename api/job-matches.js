export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { background, targetCompany, resumeData, readinessScores, gateScore } = req.body;

  const prompt = `You are Compass's job matching engine for aspiring Product Managers in India.

Given this user's profile, generate 4 realistic PM job matches at real Indian startups/companies. One MUST be at their target company (marked as target). The others should be real companies that match their background.

## Indian PM Job Market Context
- Top PM hiring companies in India: Razorpay, Flipkart, Meesho, Swiggy, PhonePe, CRED, Zerodha, Slice, Darwinbox, Jar, Groww, Lenskart, Ola, Zomato, upGrad, Freshworks, Chargebee, Zoho, Myntra, BigBasket, Dunzo, ShareChat
- PM roles: Growth PM, Product Manager, Technical PM, Platform PM, 0→1 PM, Analytics PM, AI PM, Payments PM, Consumer PM, B2B PM
- Typical stages: Series A, Series B, Series C, Series D, Unicorn, Public
- Verticals: Fintech, E-commerce, SaaS, Consumer, EdTech, HealthTech, Logistics, Social, Gaming
- Cities: Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Gurgaon

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

## Fit Score Calculation
- Base fit on how well the user's skills, experience, and dimension scores match typical requirements for that role at that company
- Be honest: most aspiring PMs are 50–75% fit. Only give 80%+ if there's strong alignment
- Include specific gaps: what dimensions they need to improve for THIS role

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "jobs": [
    {
      "title": "<PM role title>",
      "company": "<real company name>",
      "stage": "<funding stage>",
      "vertical": "<industry vertical>",
      "city": "<city>",
      "fit": <number 0-100>,
      "isTarget": <true if this is their target company, false otherwise>,
      "gapCount": <number of dimensions below 60 relevant to this role>,
      "gapNote": "<short specific note like '~4 weeks away' or '2 gaps to close' or 'Strong match'>"
    }
  ]
}

Return exactly 4 jobs. Put the target company job FIRST (position 1). Sort the remaining 3 by fit score descending. Keep job titles short (max 4 words, e.g. "Growth PM", "Technical PM", "AI Product Manager", "Platform PM").`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } }
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
