const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Environment check:', {
      NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID ? 'Present' : 'Missing',
      NETLIFY: process.env.NETLIFY ? 'Present' : 'Missing',
      context: context ? 'Present' : 'Missing'
    });
    
    // This should work automatically in Netlify environment
    const store = getStore('subscriptions');
    await store.set('test-key', JSON.stringify({ 
      test: true, 
      timestamp: new Date().toISOString() 
    }));
    
    const result = await store.get('test-key');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify Blobs is working!',
        testData: JSON.parse(result),
        environment: 'Netlify Functions'
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
        details: error.stack,
        environment: {
          NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || 'Missing',
          NETLIFY: process.env.NETLIFY || 'Missing'
        }
      })
    };
  }
};
