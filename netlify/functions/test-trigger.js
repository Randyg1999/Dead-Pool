// Manual trigger for testing the death checking system

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Manual death check triggered');
    
    // Call the check-deaths function
    const checkDeathsResponse = await fetch(`${process.env.URL}/.netlify/functions/check-deaths`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await checkDeathsResponse.json();
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Manual death check completed',
        result: result,
        timestamp: new Date().toISOString(),
        testUrl: `${process.env.URL}/.netlify/functions/test-trigger`
      })
    };

  } catch (error) {
    console.error('Manual trigger error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Manual trigger failed',
        message: error.message
      })
    };
  }
};
