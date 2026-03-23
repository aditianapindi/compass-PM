/**
 * Post-Rejection Remediation Agent
 *
 * Multi-step agentic flow:
 *   1. IDENTIFY — extract company name and interview round from user message
 *   2. RETRIEVE — pull company hiring bar + interview format via vector search (or keyword fallback)
 *   3. DIAGNOSE — compare user's readiness scores against company's bar, identify root cause
 *   4. GENERATE — build a 2-week remediation plan targeting the specific gaps
 *
 * POST /api/rejection-agent
 * Body: { message, context, readinessScores, background, targetCompany, resumeData, gateScore }
 * Returns: { diagnosis, plan, ragSource }
 */
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, context, readinessScores, background, targetCompany, resumeData, gateScore } = req.body;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // ─── STEP 1: IDENTIFY — extract company and round from message ───
  const identifyPrompt = `Extract the company name and interview round from this message. Only return a company if the user EXPLICITLY names one in their message. Do NOT assume or fill in a company they did not mention.

User message: "${message || 'I got rejected'}"

Return ONLY valid JSON, no markdown:
{ "company": "<company name ONLY if explicitly mentioned, otherwise 'unknown'>", "round": "<specific round like 'case study' or 'analytical' or 'unknown'>" }`;

  let identified = { company: 'unknown', round: 'unknown' };
  try {
    const idResp = await callGemini(GEMINI_API_KEY, identifyPrompt, 0.1, 200);
    if (idResp) identified = JSON.parse(idResp.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim());
  } catch (e) { /* use defaults */ }

  // If no company identified, ask the user
  if (!identified.company || identified.company === 'unknown') {
    return res.status(200).json({ needsInfo: true, question: "Which company rejected you? And do you know which round — was it the case study, analytics, behavioural, or something else?" });
  }

  // ─── STEP 2: RETRIEVE — get company data via vector search or keyword ───
  let companyData = null;
  let ragSource = 'none';

  // Try vector search first
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const searchQuery = `${identified.company} hiring bar interview rejection ${identified.round}`;
      const embedResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: { parts: [{ text: searchQuery }] } })
        }
      );
      const embedJson = await embedResp.json();

      if (embedJson.embedding?.values) {
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
            companyData = results.map(r => `[${r.type}] ${r.content}`).join('\n\n');
            ragSource = 'vector';
          }
        }
      }
    } catch (e) { /* fall through */ }
  }

  // Fallback: keyword match from JSON
  if (!companyData) {
    try {
      const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
      const data = JSON.parse(raw);
      const match = (data.companies || []).find(c =>
        c.name.toLowerCase() === (identified.company || '').toLowerCase()
      );
      if (match) {
        companyData = `${match.name} (${match.stage}, ${match.vertical}, ${match.city})
Hiring bar: Product Sense ${match.hiringBar.productSense}, Analytical Depth ${match.hiringBar.analyticalDepth}, Business Framing ${match.hiringBar.businessFraming}, Technical Credibility ${match.hiringBar.technicalCredibility}, AI Fluency ${match.hiringBar.aiFluency}, Behavioural ${match.hiringBar.behavioural}
Interview: ${match.interviewFormat.join(' → ')} (${match.interviewRounds} rounds)
Common rejections: ${match.commonRejectionReasons.join('; ')}
Recent signals: ${match.recentSignals.join('; ')}
Switcher note: ${match.switcherNote}`;
        ragSource = 'keyword';
      }
    } catch (e) { /* proceed without */ }
  }

  // ─── STEP 3 & 4: DIAGNOSE + GENERATE — single prompt for diagnosis and plan ───
  const userScores = readinessScores?.dimensions
    ? readinessScores.dimensions.map(d => `${d.name}: ${d.score}/100 (${d.status})`).join('\n')
    : 'No readiness scores available';

  const agentPrompt = `You are Compass's Post-Rejection Remediation Agent. A user just told you they got rejected. Your job is to diagnose WHY and build a recovery plan.

## What Happened
User message: "${message || 'I got rejected'}"
Company: ${identified.company}
Round: ${identified.round}

## Company Intelligence (Retrieved)
${companyData || 'No company data available — provide general guidance'}

## User Profile
Background: ${background || 'Not provided'}
Target company: ${targetCompany || 'Not specified'}
Current role: ${resumeData?.currentRole || 'Not provided'}
Experience: ${resumeData?.totalExperience || 'Not provided'}
Skills: ${resumeData?.skills ? resumeData.skills.join(', ') : 'Not provided'}

Gate task: ${gateScore ? `${gateScore.score}/100 — ${gateScore.headline}` : 'Not completed'}

## User's Readiness Scores
${userScores}

## Your Task

**Step 1 — Diagnose:** Compare the user's scores against the company's hiring bar. Identify which dimensions caused the rejection. Be specific — reference actual numbers.

**Step 2 — Plan:** Create a 2-week day-by-day remediation plan that targets the 2-3 weakest dimensions relative to this company's bar. Each day should have one concrete exercise (not "read about X" — actual practice tasks with deliverables).

## Rules
- Be honest and direct. This person just got rejected — they need signal, not sympathy.
- Every claim must reference actual data (their score vs company bar).
- The plan must be actionable — each day has a specific task with a clear output.
- If you don't know the company or round, focus on their weakest dimensions overall.
- Week 1 should focus on the biggest gap. Week 2 on the second gap + integration.

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "company": "<company name>",
  "round": "<interview round or 'General'>",
  "headline": "<one hard-hitting sentence — what went wrong>",
  "rootCause": {
    "primary": { "dimension": "<dimension name>", "userScore": <number>, "companyBar": <number>, "gap": <number>, "explanation": "<one sentence>" },
    "secondary": { "dimension": "<dimension name>", "userScore": <number>, "companyBar": <number>, "gap": <number>, "explanation": "<one sentence>" }
  },
  "recoveryPlan": {
    "duration": "2 weeks",
    "focusAreas": ["<dimension 1>", "<dimension 2>"],
    "weeks": [
      {
        "week": 1,
        "theme": "<what this week targets>",
        "days": [
          { "day": 1, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 2, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 3, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 4, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 5, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" }
        ]
      },
      {
        "week": 2,
        "theme": "<what this week targets>",
        "days": [
          { "day": 1, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 2, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 3, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 4, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" },
          { "day": 5, "task": "<specific exercise>", "output": "<what they produce>", "time": "<estimated minutes>" }
        ]
      }
    ]
  },
  "reapplySignal": "<one sentence — when they should try again and what score threshold to hit>"
}`;

  try {
    const result = await callGemini(GEMINI_API_KEY, agentPrompt, 0.3, 2500);
    if (!result) return res.status(200).json({ error: 'Empty response from AI' });

    const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json({ ...parsed, ragSource });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function callGemini(apiKey, prompt, temperature, maxTokens) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } }
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
