// ---------------------------------------------------------------
// _worker.js - Handles both static files and API
// ---------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ---------------------------------------------
    // Handle API request (/chat)
    // ---------------------------------------------
    if (pathname === '/chat' && request.method === 'POST') {
      // Handle OPTIONS preflight
      if (request.method === 'OPTIONS') {
        return new Response('', {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      // Get API key
      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing API key' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Parse JSON body
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { model = 'openrouter/free', messages } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Missing messages' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Call OpenRouter
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ model, messages })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ---------------------------------------------
    // Serve static files (HTML, CSS, JS, images)
    // ---------------------------------------------
    // Remove leading slash and look up the file
    let filePath = pathname === '/' ? '/index.html' : pathname;

    // Try to fetch the file from the built-in static file handling
    // Cloudflare Pages automatically serves static files from the root
    // We need to use the ASSETS binding
    return env.ASSETS.fetch(request);
  }
};
