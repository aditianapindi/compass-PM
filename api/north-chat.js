import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  // Load market data for RAG context
  let companyContext = '';
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
    const data = JSON.parse(raw);
    // Extract target company from user context
    const targetLine = (context || '').split('\n').find(l => l.startsWith('Target company:'));
    const targetName = targetLine ? targetLine.replace('Target company:', '').trim() : '';
    const match = (data.companies || []).find(c => c.name.toLowerCase() === targetName.toLowerCase());
    if (match) {
      companyContext = `\nTarget company intelligence (${match.name}):
- Hiring bar: Product Sense ${match.hiringBar.productSense}, Analytical ${match.hiringBar.analyticalDepth}, Business ${match.hiringBar.businessFraming}, Technical ${match.hiringBar.technicalCredibility}, AI ${match.hiringBar.aiFluency}
- Interview: ${match.interviewFormat.join(' → ')} (${match.interviewRounds} rounds)
- Common rejections: ${match.commonRejectionReasons.join('; ')}
- Recent signals: ${match.recentSignals.join('; ')}
- Switcher note: ${match.switcherNote}
- Salary: ${match.salaryRange}`;
    }
    // Add transition intelligence
    const bgLine = (context || '').split('\n').find(l => l.startsWith('Background:'));
    const bgName = bgLine ? bgLine.replace('Background:', '').trim() : '';
    const transitions = data.transitionIntelligence?.successRateByBackground || [];
    const bgMatch = transitions.find(t => bgName.toLowerCase().includes(t.background.toLowerCase()));
    if (bgMatch) {
      companyContext += `\nTransition intelligence for ${bgMatch.background}s: ${bgMatch.conversionRate} conversion rate, avg ${bgMatch.avgTimeToOffer} to offer. Best fit: ${bgMatch.bestFitCompanies.join(', ')}. ${bgMatch.note}`;
    }
  } catch (e) { /* silent — proceed without market data */ }

  const prompt = `You are North, an AI guide inside Compass — a PM career navigation platform.

Your personality:
- Honest and direct. Not a cheerleader. Never say "great question!"
- Specific to this user's actual data — never generic PM advice
- Concise: 2–4 sentences max per response
- Give signal and next action, not motivation
- Reference the user's actual background, score, and gaps when relevant
- When discussing companies, interview prep, or job market — use the real data provided below, not generic advice
- Address the user by their first name naturally (not every message, but regularly — it builds trust)
- If you don't have enough context to be specific, ask a clarifying question

User context:
${context}${companyContext}

User message: "${message}"

Reply as North. Plain conversational English. No bullet points. No markdown. No filler pleasantries. Just honest, specific, personalized signal.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(200).json({ error: data.error.message });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply) return res.status(200).json({ error: 'Empty response' });
    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
