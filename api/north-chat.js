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

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // --- RAG: Semantic search (primary) with keyword fallback ---
  let ragContext = '';
  let ragSource = 'none';

  // Try semantic search first (requires pgvector setup)
  if (SUPABASE_SERVICE_KEY) {
    try {
      // Embed the user's message
      const embedResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: { parts: [{ text: message }] } })
        }
      );
      const embedJson = await embedResp.json();

      if (embedJson.embedding?.values) {
        // Search Supabase pgvector for the 5 most relevant items
        const searchResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({
            query_embedding: JSON.stringify(embedJson.embedding.values),
            match_count: 5,
            filter_type: null
          })
        });

        if (searchResp.ok) {
          const results = await searchResp.json();
          if (results.length > 0) {
            ragContext = '\n\n## Retrieved Market Intelligence (from vector search)\n' +
              results.map(r => `[${r.type}] ${r.content}`).join('\n\n');
            ragSource = 'vector';
          }
        }
      }
    } catch (e) { /* fall through to keyword matching */ }
  }

  // Fallback: keyword matching from JSON file (original approach)
  if (!ragContext) {
    try {
      const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
      const data = JSON.parse(raw);
      const targetLine = (context || '').split('\n').find(l => l.startsWith('Target company:'));
      const targetName = targetLine ? targetLine.replace('Target company:', '').trim() : '';
      const match = (data.companies || []).find(c => c.name.toLowerCase() === targetName.toLowerCase());
      if (match) {
        ragContext = `\n\n## Target Company Intelligence — ${match.name} (from keyword match)\n` +
          `- Hiring bar: Product Sense ${match.hiringBar.productSense}, Analytical ${match.hiringBar.analyticalDepth}, Business ${match.hiringBar.businessFraming}, Technical ${match.hiringBar.technicalCredibility}, AI ${match.hiringBar.aiFluency}\n` +
          `- Interview: ${match.interviewFormat.join(' → ')} (${match.interviewRounds} rounds)\n` +
          `- Common rejections: ${match.commonRejectionReasons.join('; ')}\n` +
          `- Recent signals: ${match.recentSignals.join('; ')}\n` +
          `- Switcher note: ${match.switcherNote}\n` +
          `- Salary: ${match.salaryRange}`;
        ragSource = 'keyword';
      }
      // Add transition intelligence
      const bgLine = (context || '').split('\n').find(l => l.startsWith('Background:'));
      const bgName = bgLine ? bgLine.replace('Background:', '').trim() : '';
      const transitions = data.transitionIntelligence?.successRateByBackground || [];
      const bgMatch = transitions.find(t => bgName.toLowerCase().includes(t.background.toLowerCase()));
      if (bgMatch) {
        ragContext += `\nTransition intelligence for ${bgMatch.background}s: ${bgMatch.conversionRate} conversion rate, avg ${bgMatch.avgTimeToOffer} to offer. Best fit: ${bgMatch.bestFitCompanies.join(', ')}. ${bgMatch.note}`;
      }
    } catch (e) { /* proceed without market data */ }
  }

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
${context}${ragContext}

User message: "${message}"

Reply as North. Plain conversational English. No bullet points. No markdown. No filler pleasantries. Just honest, specific, personalized signal.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const geminiBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } } };

  try {
    const data = await geminiWithRetry(geminiUrl, geminiBody);
    if (data.error) return res.status(200).json({ error: data.error.message });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply) return res.status(200).json({ error: 'Empty response' });
    return res.status(200).json({ reply: reply.trim(), ragSource });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function geminiWithRetry(url, body) {
  for (let i = 0; i < 2; i++) {
    try {
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await resp.json();
      if (data.error && i === 0) { await new Promise(r => setTimeout(r, 500)); continue; }
      return data;
    } catch (e) { if (i === 1) throw e; await new Promise(r => setTimeout(r, 500)); }
  }
}
