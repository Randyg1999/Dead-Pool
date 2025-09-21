const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Manual configuration with your site ID
    const store = getStore('subscriptions', {
      siteID: '2ca25116-8692-4753-bb94-9248a003f9c2'
      // token will be auto-provided in Netlify environment
    });
    
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
        message: 'Netlify Blobs is working with manual config!',
        testData: JSON.parse(result)
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
