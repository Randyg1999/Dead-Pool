// Debug function to test push notifications

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    // Return test information
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Debug endpoint working',
        timestamp: new Date().toISOString(),
        environment: 'netlify'
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      
      console.log('Debug data received:', {
        hasEndpoint: !!data.endpoint,
        hasKeys: !!data.keys,
        userAgent: event.headers['user-agent'],
        timestamp: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Debug data logged',
          received: {
            hasEndpoint: !!data.endpoint,
            hasKeys: !!data.keys,
            keysP256dh: data.keys?.p256dh ? 'present' : 'missing',
            keysAuth: data.keys?.auth ? 'present' : 'missing'
          }
        })
      };

    } catch (error) {
      console.error('Debug error:', error);
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Debug failed',
          message: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
