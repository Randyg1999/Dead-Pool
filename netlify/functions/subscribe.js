// Netlify Function to handle push notification subscriptions with persistent storage

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const subscription = JSON.parse(event.body);
    
    // Validate subscription object
    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid subscription data' })
      };
    }

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
      console.log('No existing subscriptions found, starting fresh');
    }
    
    // Add new subscription (with simple deduplication)
    const subscriptionId = Date.now().toString();
    subscription.id = subscriptionId;
    subscription.addedAt = new Date().toISOString();
    
    subscriptions.push(subscription);
    
    // Save back to blob storage
    await store.set('all-subscriptions', JSON.stringify(subscriptions));
    
    console.log('New subscription saved:', subscriptionId);
    console.log('Total subscriptions:', subscriptions.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        subscriptionId,
        totalSubscribers: subscriptions.length,
        message: 'Subscription saved successfully' 
      })
    };

  } catch (error) {
    console.error('Error saving subscription:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save subscription',
        details: error.message 
      })
    };
  }
};
