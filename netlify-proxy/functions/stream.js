const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Determine referer based on target URL
function getRefererForUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Common streaming CDN patterns - return full browser-like headers
    if (hostname.includes('biananset') || hostname.includes('kiwi') || hostname.includes('listeamed') || hostname.includes('akamai')) {
      return { 
        referer: 'https://megacloud.tv/', 
        origin: 'https://megacloud.tv',
        secFetchSite: 'cross-site'
      };
    }
    if (hostname.includes('megacloud') || hostname.includes('rapid-cloud')) {
      return { 
        referer: 'https://megacloud.tv/', 
        origin: 'https://megacloud.tv',
        secFetchSite: 'same-origin'
      };
    }
    if (hostname.includes('vidcloud') || hostname.includes('vizcloud') || hostname.includes('rabbitstream')) {
      return { 
        referer: 'https://rabbitstream.net/', 
        origin: 'https://rabbitstream.net',
        secFetchSite: 'cross-site'
      };
    }
    if (hostname.includes('gogoanime') || hostname.includes('gogocdn') || hostname.includes('playgo1')) {
      return { 
        referer: 'https://gogoanime.tel/', 
        origin: 'https://gogoanime.tel',
        secFetchSite: 'cross-site'
      };
    }
    
    // Default - use same origin pattern
    return { 
      referer: `${urlObj.protocol}//${urlObj.host}/`, 
      origin: `${urlObj.protocol}//${urlObj.host}`,
      secFetchSite: 'same-origin'
    };
  } catch {
    return { 
      referer: 'https://megacloud.tv/', 
      origin: 'https://megacloud.tv',
      secFetchSite: 'cross-site'
    };
  }
}

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
    const { referer, origin, secFetchSite } = getRefererForUrl(targetUrl);
    
    // Full browser-like headers to bypass CDN protection
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': process.env.MEGACLOUD_REFERER || referer,
        'Origin': process.env.MEGACLOUD_ORIGIN || origin,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': secFetchSite,
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
