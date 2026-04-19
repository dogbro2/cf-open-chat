// ---------------------------------------------------------------
// functions/api/chat.js
// Proxy for OpenRouter chat completions.
// Keeps OPENROUTER_API_KEY secret (set in Pages → Settings → Environment Variables)
// ---------------------------------------------------------------
export const onRequestPost = async (context) => {
  // 1️⃣ Read the incoming JSON body from the UI
  let payload;
  try {
    payload = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Basic validation – you can expand this as needed
  if (!payload.messages || !Array.isArray(payload.messages) || payload.messages.length === 0) {
    return new Response(JSON.stringify({ error: '`messages` array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2️⃣ Pull the secret key from the environment
  const apiKey = context.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server mis‑configuration: missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3️⃣ Build the request to OpenRouter
  const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
  const openRouterPayload = {
    // You can hard‑code a model or let the client send it.
    // Example: "openrouter/free" lets OpenRouter pick the best free model.
    model: payload.model || 'openrouter/free',
    messages: payload.messages,
    // Forward optional sampling params if the client sent them
    temperature: payload.temperature ?? 0.7,
    max_tokens: payload.max_tokens ?? 512,
    stream: false   // we keep it simple; set true if you want streaming
  };

  // 4️⃣ Call OpenRouter
  let openRouterResp;
  try {
    openRouterResp = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Optional: help OpenRouter rank models
        'HTTP-Referer': context.request.headers.get('Referer') || 'https://example.com',
        'X-Title': 'Cloudflare Pages OpenRouter Demo'
      },
      body: JSON.stringify(openRouterPayload)
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to reach OpenRouter', details: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5️⃣ If OpenRouter returned an error, forward it
  if (!openRouterResp.ok) {
    const errBody = await openRouterResp.text();
    return new Response(errBody, {
      status: openRouterResp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 6️⃣ Otherwise, pipe the JSON straight back to the browser
  const data = await openRouterResp.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
