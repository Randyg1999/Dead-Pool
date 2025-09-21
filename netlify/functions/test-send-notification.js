// Test function to trigger a fake death notification

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Triggering test death notification...');

    // Get the base URL for this site
    const baseUrl = process.env.URL || 'https://dirty-oar-dead-pool.netlify.app';
    
    // Send a test notification
    const response = await fetch(`${baseUrl}/.netlify/functions/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '💀 TEST: Dead Pool Alert!',
        body: 'Betty White has died! This is just a test notification.',
        playerName: 'TestPlayer',
        celebrityName: 'Betty White (TEST)',
        dateOfDeath: 'December 31, 2021'
      })
    });

    if (!response.ok) {
      throw new Error(`Send notification failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Test notification sent successfully!',
        result: result,
        testInfo: {
          title: '💀 TEST: Dead Pool Alert!',
          body: 'Betty White has died! This is just a test notification.',
          celebrityName: 'Betty White (TEST)'
        }
      })
    };

  } catch (error) {
    console.error('Test notification failed:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Test notification failed'
      })
    };
  }
};
