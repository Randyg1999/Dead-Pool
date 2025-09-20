// Netlify Function to handle push notification subscriptions

const subscriptions = new Map(); // In-memory storage for demo

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

    // Store subscription (in real app, save to database)
    const subscriptionId = Date.now().toString();
    subscriptions.set(subscriptionId, subscription);
    
    console.log('New subscription saved:', subscriptionId);
    console.log('Total subscriptions:', subscriptions.size);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        subscriptionId,
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
