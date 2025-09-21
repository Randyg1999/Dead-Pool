// Test function to verify GitHub Gist storage is working

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Test GitHub token
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token not found in environment variables');
    }

    console.log('Testing GitHub API access...');

    // Test GitHub API access
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
    }

    const userData = await response.json();

    // Test creating/reading a gist
    const testSubscription = {
      endpoint: 'https://test.example.com/push',
      keys: {
        p256dh: 'test-key',
        auth: 'test-auth'
      },
      id: 'test-' + Date.now(),
      addedAt: new Date().toISOString()
    };

    // Try to save a test subscription
    await saveTestSubscription(testSubscription);

    // Try to read it back
    const subscriptions = await getSubscriptionsFromGist();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'GitHub Gist storage is working!',
        githubUser: userData.login,
        testData: {
          subscriptionsFound: subscriptions.length,
          testSubscriptionSaved: true
        },
        environment: {
          GITHUB_TOKEN: 'Present',
          NODE_ENV: process.env.NODE_ENV || 'production'
        }
      })
    };

  } catch (error) {
    console.error('GitHub Gist test failed:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        environment: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN ? 'Present' : 'Missing'
        }
      })
    };
  }
};

// Get subscriptions from GitHub Gist
async function getSubscriptionsFromGist() {
  const token = process.env.GITHUB_TOKEN;
  
  const gistsResponse = await fetch('https://api.github.com/gists', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!gistsResponse.ok) {
    throw new Error(`GitHub API error: ${gistsResponse.status}`);
  }

  const gists = await gistsResponse.json();
  const deadPoolGist = gists.find(gist => 
    gist.files['dead-pool-subscriptions.json'] || 
    gist.description === 'Dead Pool Notification Subscriptions'
  );

  if (!deadPoolGist) {
    return [];
  }

  const gistResponse = await fetch(deadPoolGist.url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!gistResponse.ok) {
    throw new Error(`Failed to fetch gist: ${gistResponse.status}`);
  }

  const gistData = await gistResponse.json();
  const fileContent = gistData.files['dead-pool-subscriptions.json'].content;
  
  return JSON.parse(fileContent);
}

// Save test subscription
async function saveTestSubscription(subscription) {
  const token = process.env.GITHUB_TOKEN;
  
  const gistData = {
    description: 'Dead Pool Notification Subscriptions',
    public: false,
    files: {
      'dead-pool-subscriptions.json': {
        content: JSON.stringify([subscription], null, 2)
      },
      'README.md': {
        content: `# Dead Pool Subscriptions (Test)\n\nCreated: ${new Date().toISOString()}\nThis is a test gist for Dead Pool notifications.`
      }
    }
  };

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
    throw new Error(`Failed to create test gist: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
