// Generate proper VAPID keys for production use

const webpush = require('web-push');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Generate proper VAPID keys
    const vapidKeys = webpush.generateVAPIDKeys();

    // Set VAPID details for web-push
    webpush.setVapidDetails(
      'mailto:deadpool@example.com', // You can use a real email here
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        keys: {
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey
        },
        message: 'Real VAPID keys generated',
        instructions: 'Add these to your Netlify environment variables as VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to generate VAPID keys',
        message: error.message
      })
    };
  }
};
