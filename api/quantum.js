// Quantum Mind API - REAL ONLY - Fixed model - Groq
// You can embed key directly here as fallback if Vercel ENV fails
const EMBEDDED_FALLBACK_KEY = ""; // optional: paste gsk_... here if you want key in code

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const hasEnv = !!process.env.GROQ_API_KEY || !!EMBEDDED_FALLBACK_KEY;
    return res.status(200).json({
      status: hasEnv ? 'ENV_OK_SECURE' : 'ENV_MISSING',
      hasEnv,
      message: hasEnv ? 'Key found secure' : 'Add GROQ_API_KEY in Vercel or embed in code',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-8b-8192']
    });
  }

  try {
    const body = req.body || {};
    const message = (body.message || '').toString().slice(0, 3000);
    const clientKey = (body.apiKey || '').toString().trim().replace(/\s/g,'');
    const envKey = (process.env.GROQ_API_KEY || '').toString().trim().replace(/\s/g,'');
    const finalKey = clientKey || envKey || EMBEDDED_FALLBACK_KEY.trim().replace(/\s/g,'');

    if (!message) return res.status(400).json({ reply: 'Empty', status: 'EMPTY' });
    if (!finalKey) {
      return res.status(200).json({
        reply: 'Quantum: No key. Paste gsk_... in Settings Test Real AI Secure. Or add in Vercel ENV or embed in api/quantum.js EMBEDDED_FALLBACK_KEY',
        status: 'ENV_MISSING'
      });
    }

    // Try models in order until one works
    const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-8b-8192', 'llama-3.1-8b-instant'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${finalKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are Quantum Mind secure real AI inside ChatSpark SECURE E2E real only app. Logo Q + brain orbits blue purple cyan. Helpful concise secure. Real only no fake.' },
              { role: 'user', content: message }
            ],
            max_tokens: 900,
            temperature: 0.7
          })
        });
        const data = await groqRes.json();
        if (groqRes.ok && data?.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content, status: `OK_${model}_SECURE`, model });
        }
        const err = data?.error?.message || `HTTP ${groqRes.status}`;
        lastError = err;
        // If model not found, try next model
        if (err.toLowerCase().includes('model') && (err.toLowerCase().includes('does not exist') || err.toLowerCase().includes('not found'))) {
          continue;
        }
        // Invalid key error - stop
        if (err.toLowerCase().includes('invalid') && err.toLowerCase().includes('api key')) {
          return res.status(200).json({ reply: `Error: Invalid API Key - Get new key at console.groq.com`, status: 'INVALID_KEY' });
        }
        // Other error - return it
        return res.status(200).json({ reply: `Groq error with ${model}: ${err}`, status: 'GROQ_ERROR' });
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }

    return res.status(200).json({ reply: `All models failed. Last error: ${lastError}. Try new key at console.groq.com`, status: 'ALL_MODELS_FAILED' });

  } catch (e) {
    return res.status(500).json({ reply: `Server error: ${e.message}`, status: 'SERVER_ERROR' });
  }
}
