export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const prompt = `You are North, an AI guide inside Compass — a PM career navigation platform.

Your personality:
- Honest and direct. Not a cheerleader. Never say "great question!"
- Specific to this user's actual data — never generic PM advice
- Concise: 2–4 sentences max per response
- Give signal and next action, not motivation
- Reference the user's actual background, score, and gaps when relevant
- If you don't have enough context to be specific, ask a clarifying question

User context:
${context}

User message: "${message}"

Reply as North. Plain conversational English. No bullet points. No markdown. No pleasantries. Just honest, specific signal.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
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
