// Temporary function to generate VAPID keys for testing

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Simple VAPID key generation for testing
  // In production, you'd use a proper crypto library
  function generateVAPIDKeys() {
    const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80j4JKt25_6DBLRUW6nNHHmxVxjL3pEcaykDbMDpSS6NxRGhtJ-4TLuU';
    const privateKey = 'fVxCqhkDmU7A8KMLo-3-wZZzKj3nLx8kMcOr3y2wFeg';
    
    return {
      publicKey,
      privateKey,
      subject: 'mailto:test@deadpool.com'
    };
  }

  const keys = generateVAPIDKeys();

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      keys: keys,
      message: 'VAPID keys for testing'
    })
  };
};
