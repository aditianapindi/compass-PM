/**
 * Score any daily task type (generalization of score-gate.js)
 *
 * POST /api/score-task
 * Body: { text, taskType, taskPrompt, dimension, background, targetCompany }
 * Returns: { score, headline, strength, gap, dimensionImpact: { name, delta, newEstimate } }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text, taskType, taskPrompt, dimension, background, targetCompany, currentDimScore } = req.body;
  if (!text || text.length < 20) return res.status(400).json({ error: 'Response too short' });

  const rubrics = {
    'product-teardown': `Score this product teardown:
80-100: Identifies the USER, the PROBLEM, and the METRIC that would move. All three present with specificity.
60-79: Has two of three clearly, one dimension is weak or generic.
40-59: Leads with a solution ("I'd add X") without grounding in user problem. Common for new PM thinkers.
0-39: Too generic — could apply to any product. No evidence of structured thinking.`,

    'metric-diagnosis': `Score this metric diagnosis:
80-100: Structured decomposition into components, considers multiple hypotheses with data sources to validate each, prioritizes by likelihood and impact.
60-79: Good decomposition but missing one of: multiple hypotheses, data validation approach, or clear prioritization.
40-59: Lists possible causes but doesn't structure the diagnosis. No prioritization or validation plan.
0-39: Guesses at causes without any analytical framework. No mention of data.`,

    'business-case': `Score this business case:
80-100: Clear market sizing logic, competitive positioning, revenue model, and risk assessment. Shows understanding of unit economics.
60-79: Good structure but missing one of: market sizing, competitive context, or revenue reasoning.
40-59: Presents opinion without supporting logic. Says "should enter because it's a big market" without specifics.
0-39: No business reasoning. Just a product feature pitch without commercial framing.`,

    'technical-tradeoff': `Score this technical tradeoff analysis:
80-100: Clearly articulates both options, identifies specific tradeoffs (latency vs consistency, build vs buy), considers user impact, and makes a defensible recommendation.
60-79: Understands the tradeoff but doesn't fully articulate user impact or makes recommendation without clear reasoning.
40-59: Describes the options but doesn't compare them meaningfully. Says "it depends" without committing.
0-39: No technical depth. Describes what the feature does without engaging with the tradeoff.`,

    'ai-feature-design': `Score this AI feature design:
80-100: Proposes a genuinely AI-native capability (not an AI wrapper), explains what data/model powers it, considers failure modes, and articulates user value clearly.
60-79: Good AI application but missing one of: data/model reasoning, failure handling, or clear user value.
40-59: Proposes "add AI to X" without explaining what AI actually does differently. AI as a buzzword, not a capability.
0-39: No understanding of AI capabilities. Proposes something that doesn't need AI or isn't technically feasible.`,

    'stakeholder-conflict': `Score this stakeholder response:
80-100: Acknowledges the other perspective, provides data-backed reasoning, proposes a resolution path, and maintains relationship. PM-level influence without authority.
60-79: Good reasoning but either dismisses the other perspective or agrees too easily without defending their position.
40-59: Defends their position but doesn't acknowledge the other side. Comes across as confrontational or passive.
0-39: No conflict resolution skill shown. Either caves immediately or escalates unnecessarily.`,

    'networking': `Score this networking/outreach piece:
80-100: Personalized to the specific person and company, references real product work or challenges, shows genuine product curiosity, has a clear and easy-to-accept ask. Would actually get a response.
60-79: Good structure and intent but either too generic or the ask is unclear. Shows effort but not enough specificity.
40-59: Template-sounding. Could be sent to anyone at any company. No evidence of research or genuine interest.
0-39: Unprofessional, overly self-focused, or completely generic. No one would respond to this.`,

    'portfolio': `Score this portfolio piece:
80-100: Clear problem framing grounded in user evidence, structured reasoning, specific metrics, and polished narrative. Demonstrates PM thinking — not just description of what happened.
60-79: Good structure but missing one of: clear metrics, user grounding, specific evidence, or actionable insight.
40-59: Describes what happened but doesn't frame it as PM impact. Tells instead of shows. No measurable outcomes.
0-39: Too vague to demonstrate PM skills. No metrics, no structure, no evidence of analytical thinking.`
  };

  const rubric = rubrics[taskType] || rubrics['product-teardown'];

  const prompt = `You are a PM skills assessor for Compass. Score this user's response to a daily practice task.

## Task Given
Type: ${taskType}
Dimension: ${dimension}
Prompt: "${taskPrompt}"

## User's Response
"${text}"

## User Context
Background: ${background || 'Not provided'}
Target company: ${targetCompany || 'Not specified'}

## Scoring Rubric
${rubric}

## Score Impact
The user's current score in ${dimension} is ${currentDimScore || 50}/100.
Based on the quality of this response, estimate how many points this practice would add to their ${dimension} score.
Rules:
- Excellent response (80-100): +3 to +5 points
- Good response (60-79): +2 to +3 points
- Developing response (40-59): +1 point
- Weak response (0-39): +0 points (not enough depth to improve)
- Cap the new estimate at 100

## Response Format
Return ONLY valid JSON, no markdown, no backticks:
{
  "score": <0-100>,
  "headline": "<one sentence — what their response reveals about their ${dimension}>",
  "strength": "<one specific thing they did well>",
  "gap": "<one specific thing they missed>",
  "dimensionImpact": {
    "name": "${dimension}",
    "delta": <+0 to +5>,
    "newEstimate": <current score + delta, max 100>
  }
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } }
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
