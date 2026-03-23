/**
 * One-time script: embed all company profiles and job listings into Supabase pgvector.
 *
 * Prerequisites:
 *   1. Run scripts/supabase-setup.sql in Supabase SQL Editor
 *   2. Fill in your keys in the .env file at the project root
 *
 * Usage:
 *   node scripts/embed-market-data.js
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL'); process.exit(1); }
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!GEMINI_API_KEY) { console.error('Missing GEMINI_API_KEY'); process.exit(1); }
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1); }

// Load market data
const raw = readFileSync(join(__dirname, '..', 'data', 'pm-market-data.json'), 'utf8');
const data = JSON.parse(raw);

// Build text chunks — one per company, one per job listing
function companyToText(c) {
  return `${c.name} is a ${c.stage} ${c.vertical} company in ${c.city}. ` +
    `PM team size: ${c.pmTeamSize}. Annual junior PM intake: ${c.annualJuniorPMIntake}. ` +
    `Hiring bar: Product Sense ${c.hiringBar.productSense}, Analytical Depth ${c.hiringBar.analyticalDepth}, ` +
    `Business Framing ${c.hiringBar.businessFraming}, Technical Credibility ${c.hiringBar.technicalCredibility}, ` +
    `AI Fluency ${c.hiringBar.aiFluency}, Behavioural ${c.hiringBar.behavioural}. ` +
    `Interview: ${c.interviewFormat.join(' → ')} (${c.interviewRounds} rounds). ` +
    `Switcher-friendly: ${c.switcherFriendly ? 'Yes — ' + c.switcherNote : 'No — ' + c.switcherNote}. ` +
    `Common rejections: ${c.commonRejectionReasons.join('; ')}. ` +
    `Recent signals: ${c.recentSignals.join('; ')}. ` +
    `Top roles: ${c.topRoles.join(', ')}. ` +
    `Priority skills: ${c.skillsWeighted.join(', ')}. ` +
    `Salary: ${c.salaryRange}.`;
}

function jobToText(j) {
  const reqParts = Object.entries(j.requirements)
    .map(([k, v]) => {
      const names = {
        productSense: 'Product Sense', analyticalDepth: 'Analytical Depth',
        businessFraming: 'Business Framing', technicalCredibility: 'Technical Credibility',
        aiFluency: 'AI Fluency', behavioural: 'Behavioural'
      };
      return `${names[k] || k}: ${v}`;
    }).join(', ');
  return `${j.title} at ${j.company} (${j.stage}, ${j.vertical}, ${j.city}). ` +
    `${j.description} ` +
    `Requirements: ${reqParts}. ` +
    `Salary: ${j.salary}. Interview rounds: ${j.interviewRounds}. ` +
    `Switcher-friendly: ${j.switcherFriendly ? 'Yes' : 'No'}.`;
}

// Also embed market trends and transition intelligence
function trendToText(t) {
  return `Market trend: ${t.trend}. ${t.detail} Impact: ${t.impact}. Source: ${t.source}.`;
}

function transitionToText(t) {
  return `Transition intelligence for ${t.background}: Conversion rate ${t.conversionRate}. ` +
    `Average time to offer: ${t.avgTimeToOffer}. ` +
    `Best fit companies: ${t.bestFitCompanies.join(', ')}. ${t.note}`;
}

// Build all chunks
const chunks = [];

for (const c of data.companies || []) {
  chunks.push({ id: `company-${c.name.toLowerCase().replace(/\s+/g, '-')}`, type: 'company', content: companyToText(c), metadata: { name: c.name, vertical: c.vertical, city: c.city } });
}

for (const j of data.jobListings || []) {
  chunks.push({ id: `job-${j.id}`, type: 'job', content: jobToText(j), metadata: { title: j.title, company: j.company, salary: j.salary } });
}

for (const t of data.marketTrends || []) {
  chunks.push({ id: `trend-${t.trend.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`, type: 'trend', content: trendToText(t), metadata: { trend: t.trend, impact: t.impact } });
}

for (const t of (data.transitionIntelligence?.successRateByBackground || [])) {
  chunks.push({ id: `transition-${t.background.toLowerCase().replace(/\s+/g, '-')}`, type: 'transition', content: transitionToText(t), metadata: { background: t.background } });
}

console.log(`Prepared ${chunks.length} chunks to embed (${data.companies?.length || 0} companies, ${data.jobListings?.length || 0} jobs, ${data.marketTrends?.length || 0} trends, ${data.transitionIntelligence?.successRateByBackground?.length || 0} transitions)`);

// Embed using Gemini gemini-embedding-001
async function embed(text) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    }
  );
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message);
  return json.embedding.values;
}

// Upsert into Supabase
async function upsert(row) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(row)
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase upsert failed for ${row.id}: ${err}`);
  }
}

// Run
async function main() {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`[${i + 1}/${chunks.length}] Embedding ${chunk.id}...`);

    const embedding = await embed(chunk.content);
    await upsert({
      id: chunk.id,
      type: chunk.type,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: JSON.stringify(embedding)
    });

    console.log(' ✓');

    // Small delay to avoid rate limits
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone! ${chunks.length} embeddings stored in Supabase.`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
