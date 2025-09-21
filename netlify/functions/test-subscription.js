// Test subscription function to debug the subscription process

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Testing subscription save process...');

    // Create a fake subscription to test GitHub Gist saving
    const testSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-12345',
      expirationTime: null,
      keys: {
        p256dh: 'BMF8Ky4bFBhXlVcOV0xXLq1TQMtYEUeCY_XJ0KvQUzCCFh0lGVL3WD9h8x9JKhzKQz4k',
        auth: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80j4JKt25'
      },
      id: 'test-' + Date.now(),
      addedAt: new Date().toISOString()
    };

    console.log('Attempting to save test subscription to GitHub Gist...');

    // Try to save the subscription using the same logic as subscribe.js
    const result = await saveTestSubscription(testSubscription);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Test subscription saved successfully',
        gistInfo: {
          id: result.id,
          url: result.html_url,
          files: Object.keys(result.files)
        },
        testSubscription: testSubscription
      })
    };

  } catch (error) {
    console.error('Test subscription failed:', error);

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

// Save test subscription to GitHub Gist
async function saveTestSubscription(subscription) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  const gistData = {
    description: 'Dead Pool Notification Subscriptions',
    public: false,
    files: {
      'dead-pool-subscriptions.json': {
        content: JSON.stringify([subscription], null, 2)
      },
      'README.md': {
        content: `# Dead Pool Subscriptions\n\nLast updated: ${new Date().toISOString()}\nTotal subscribers: 1\n\nThis gist stores push notification subscriptions for the Dead Pool app.`
      }
    }
  };

  console.log('Creating new gist...');

  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gistData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub API error:', response.status, errorText);
    throw new Error(`Failed to create gist: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Gist created successfully:', result.html_url);
  
  return result;
}
