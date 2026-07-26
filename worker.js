// Cloudflare Worker — CORS Proxy for GeckoTerminal + DexScreener
// Deploy: Cloudflare Dashboard → Workers → Create → Paste this → Save

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Only allow specific APIs
    const allowed = [
      'api.geckoterminal.com',
      'api.dexscreener.com',
    ];
    const targetUrl = new URL(target);
    if (!allowed.includes(targetUrl.hostname)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: corsHeaders(),
      });
    }

    try {
      const res = await fetch(target, {
        headers: { 'Accept': 'application/json' },
      });
      const body = await res.text();

      return new Response(body, {
        status: res.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: corsHeaders(),
      });
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
