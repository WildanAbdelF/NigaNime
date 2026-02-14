const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
        'Accept': '*/*',
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
