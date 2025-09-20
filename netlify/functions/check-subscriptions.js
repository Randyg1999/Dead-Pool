// Simple function to check how many subscriptions are stored

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Get blob store
    const store = getStore('subscriptions');
    
    // Get existing subscriptions
    let subscriptions = [];
    try {
      const existingData = await store.get('all-subscriptions');
      if (existingData) {
        subscriptions = JSON.parse(existingData);
      }
    } catch (error) {
      console.log('No subscriptions found');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        totalSubscriptions: subscriptions.length,
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          addedAt: sub.addedAt,
          endpoint: sub.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'No endpoint'
        }))
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
