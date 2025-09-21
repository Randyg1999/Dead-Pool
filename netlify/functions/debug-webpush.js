// Debug function to check web-push and VAPID configuration

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Checking web-push and VAPID configuration...');

    // Check if web-push is available
    let webpushAvailable = false;
    let webpushError = null;
    
    try {
      const webpush = require('web-push');
      webpushAvailable = true;
      console.log('web-push library loaded successfully');
    } catch (error) {
      webpushError = error.message;
      console.error('web-push library not available:', error.message);
    }

    // Check environment variables
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    // Test VAPID key format (they should be base64url encoded)
    let vapidFormatValid = false;
    if (vapidPublic && vapidPrivate) {
      // VAPID keys should be 65 characters long and base64url encoded
      vapidFormatValid = vapidPublic.length === 65 && vapidPrivate.length === 65;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        diagnostics: {
          webpush: {
            available: webpushAvailable,
            error: webpushError
          },
          environment: {
            VAPID_PUBLIC_KEY: vapidPublic ? `Present (${vapidPublic.length} chars)` : 'Missing',
            VAPID_PRIVATE_KEY: vapidPrivate ? `Present (${vapidPrivate.length} chars)` : 'Missing',
            GITHUB_TOKEN: githubToken ? 'Present' : 'Missing',
            vapidFormatValid: vapidFormatValid
          },
          nodeVersion: process.version,
          platform: process.platform
        }
      })
    };

  } catch (error) {
    console.error('Diagnostic check failed:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};
