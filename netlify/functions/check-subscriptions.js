// Debug function to check Netlify Blobs availability

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Try to get site info
    console.log('Environment variables:');
    console.log('NETLIFY_SITE_ID:', process.env.NETLIFY_SITE_ID);
    console.log('NETLIFY:', process.env.NETLIFY);
    
    // Try to create store
    const store = getStore('test-store');
    console.log('Store created successfully');
    
    // Try a simple operation
    await store.set('test-key', 'test-value');
    const value = await store.get('test-key');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify Blobs is working!',
        testValue: value,
        siteId: process.env.NETLIFY_SITE_ID || 'Not found'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        siteId: process.env.NETLIFY_SITE_ID || 'Not found',
        netlifyEnv: process.env.NETLIFY || 'Not found'
      })
    };
  }
};
