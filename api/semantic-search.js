/**
 * Semantic search endpoint — embeds a query and finds the most relevant
 * items from the Supabase pgvector embeddings table.
 *
 * POST /api/semantic-search
 * Body: { query: string, type?: string, limit?: number }
 * Returns: { results: [{ id, type, content, metadata, similarity }] }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { query, type, limit = 5 } = req.body;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!GEMINI_API_KEY || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing API keys' });
  }

  try {
    // Step 1: Embed the query using Gemini gemini-embedding-001
    const embedResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query }] }
        })
      }
    );
    const embedJson = await embedResp.json();
    if (embedJson.error) return res.status(500).json({ error: embedJson.error.message });
    const queryEmbedding = embedJson.embedding.values;

    // Step 2: Call Supabase RPC for vector similarity search
    // This requires a SQL function — see setup instructions in embed-market-data.js
    const typeFilter = type ? `, '${type}'` : ', NULL';
    const rpcResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: limit,
        filter_type: type || null
      })
    });

    if (!rpcResp.ok) {
      const err = await rpcResp.text();
      return res.status(500).json({ error: `Supabase search failed: ${err}` });
    }

    const results = await rpcResp.json();
    return res.status(200).json({ results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
