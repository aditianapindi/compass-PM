import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { readinessScores } = req.body;

  // Load market data
  let marketData = {};
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'pm-market-data.json'), 'utf8');
    marketData = JSON.parse(raw);
  } catch (e) {
    return res.status(500).json({ error: 'Could not load market data: ' + e.message });
  }

  const listings = marketData.jobListings || [];
  if (!listings.length) return res.status(200).json({ jobs: [] });

  // Build user scores map from readinessScores dimensions
  // Dimension name → camelCase key mapping
  const dimKeyMap = {
    'Product Sense': 'productSense',
    'Analytical Depth': 'analyticalDepth',
    'Business Framing': 'businessFraming',
    'Technical Credibility': 'technicalCredibility',
    'AI Fluency': 'aiFluency',
    'Behavioural': 'behavioural'
  };

  const userScores = {};
  if (readinessScores && readinessScores.dimensions) {
    readinessScores.dimensions.forEach(d => {
      const key = dimKeyMap[d.name] || d.name;
      userScores[key] = d.score;
    });
  }

  // Fallback scores if no readiness data
  const defaultScores = {
    productSense: 58,
    analyticalDepth: 44,
    businessFraming: 53,
    technicalCredibility: 81,
    aiFluency: 37,
    behavioural: 62
  };

  const scores = Object.keys(userScores).length > 0 ? userScores : defaultScores;

  // Calculate fit percentage for each job
  const jobsWithFit = listings.map(job => {
    const reqs = job.requirements || {};
    const reqKeys = Object.keys(reqs);

    if (reqKeys.length === 0) {
      return { ...job, fit: 50, dimComparisons: [] };
    }

    // Calculate fit: average of (userScore / requiredScore) capped at 1.0, then * 100
    let totalRatio = 0;
    const dimComparisons = [];

    reqKeys.forEach(key => {
      const required = reqs[key];
      const userScore = scores[key] || 50;
      const ratio = Math.min(userScore / required, 1.0);
      totalRatio += ratio;

      // Friendly dimension name
      const nameMap = {
        productSense: 'Product Sense',
        analyticalDepth: 'Analytical',
        businessFraming: 'Business',
        technicalCredibility: 'Technical',
        aiFluency: 'AI Fluency',
        behavioural: 'Behavioural'
      };

      dimComparisons.push({
        name: nameMap[key] || key,
        key: key,
        required: required,
        userScore: userScore,
        met: userScore >= required
      });
    });

    const fit = Math.round((totalRatio / reqKeys.length) * 100);

    return { ...job, fit, dimComparisons };
  });

  // Sort by fit descending
  jobsWithFit.sort((a, b) => b.fit - a.fit);

  return res.status(200).json({ jobs: jobsWithFit });
}
