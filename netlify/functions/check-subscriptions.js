const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Environment variables check:', {
      NETLIFY_BLOBS_ENABLED: process.env.NETLIFY_BLOBS_ENABLED || 'Missing',
      NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID ? 'Present' : 'Missing',
      NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? 'Present' : 'Missing'
    });

    // Use explicit configuration with environment variables
    const store = getStore('subscriptions', {
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN
    });
    
    await store.set('test-key', JSON.stringify({ 
      test: true, 
      timestamp: new Date().toISOString(),
      message: 'Blobs working with manual config!'
    }));
    
    const result = await store.get('test-key');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify Blobs is working!',
        testData: JSON.parse(result),
        environment: 'Manual configuration'
      })
    };
    
  } catch (error) {
    console.error('Blobs error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        environment: {
          NETLIFY_BLOBS_ENABLED: process.env.NETLIFY_BLOBS_ENABLED || 'Missing',
          NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID ? 'Present' : 'Missing',
          NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? 'Present' : 'Missing'
        }
      })
    };
  }
};
