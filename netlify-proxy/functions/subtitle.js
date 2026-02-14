const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Determine referer based on target URL
function getRefererForUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('megacloud') || hostname.includes('rapid-cloud') || hostname.includes('biananset') || hostname.includes('kiwi')) {
      return { referer: 'https://megacloud.tv/', origin: 'https://megacloud.tv' };
    }
    if (hostname.includes('rabbitstream') || hostname.includes('vidcloud')) {
      return { referer: 'https://rabbitstream.net/', origin: 'https://rabbitstream.net' };
    }
    
    return { referer: `${urlObj.protocol}//${urlObj.host}/`, origin: `${urlObj.protocol}//${urlObj.host}` };
  } catch {
    return { referer: 'https://megacloud.tv/', origin: 'https://megacloud.tv' };
  }
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
    const { referer, origin } = getRefererForUrl(targetUrl);
    
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': referer,
        'Origin': origin,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    if (!upstream.ok) {
      console.error('Subtitle fetch failed', targetUrl, upstream.status);
      return {
        statusCode: upstream.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Upstream rejected subtitle', status: upstream.status }),
      };
    }

    const contentType = upstream.headers.get('content-type') || 'text/vtt';
    const text = await upstream.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=86400',
      },
      body: text,
    };
  } catch (error) {
    console.error('Subtitle proxy error', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Subtitle proxy error', details: String(error) }),
    };
  }
};
