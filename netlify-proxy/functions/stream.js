const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function rewriteM3u8(manifest, originalUrl, proxyBase) {
  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/') + 1);
  return manifest
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return line;
      }
      const fullUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
      return `${proxyBase}/stream?url=${encodeURIComponent(fullUrl)}`;
    })
    .join('\n');
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      body: '',
    };
  }

  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Missing url parameter' }),
    };
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': process.env.MEGACLOUD_REFERER || 'https://megacloud.blog/',
        'Origin': process.env.MEGACLOUD_ORIGIN || 'https://megacloud.blog',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
      },
    });

    if (!upstream.ok) {
      console.error('Proxy fetch failed', targetUrl, upstream.status);
      return {
        statusCode: upstream.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Upstream rejected', status: upstream.status }),
      };
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    // For M3U8 files, rewrite URLs
    if (contentType.includes('mpegurl') || targetUrl.endsWith('.m3u8')) {
      const manifest = await upstream.text();
      const proxyBase = process.env.PUBLIC_PROXY_BASE || process.env.URL || '';
      const rewritten = rewriteM3u8(manifest, targetUrl, proxyBase);

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-cache',
        },
        body: rewritten,
      };
    }

    // For video segments (TS, MP4, etc.)
    const buffer = await upstream.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Proxy error', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Proxy server error', details: String(error) }),
    };
  }
};
