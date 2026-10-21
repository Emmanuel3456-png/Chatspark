exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'GROQ_API_KEY not set in Netlify env vars. Go to Site Settings > Environment Variables > Add GROQ_API_KEY' }) };
  try {
    const { messages } = JSON.parse(event.body);
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.1-70b-versatile', messages, temperature: 0.7, max_tokens: 3000 })
    });
    const data = await groqRes.json();
    if (!groqRes.ok) return { statusCode: groqRes.status, headers, body: JSON.stringify({ error: data.error?.message || 'Groq error' }) };
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
