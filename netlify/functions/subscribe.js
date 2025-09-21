// Netlify Function to handle push notification subscriptions with GitHub Gist storage

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
    
    console.log('Subscription request received:', {
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      hasKeys: !!subscription.keys,
      timestamp: new Date().toISOString()
    });
    
    // Validate subscription object
    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid subscription data' })
      };
    }

    // Get existing subscriptions from GitHub Gist
    let subscriptions = [];
    let gistId = null;
    
    try {
      console.log('Looking for existing gist...');
      const existingData = await getSubscriptionsFromGist();
      subscriptions = existingData.subscriptions || [];
      gistId = existingData.gistId;
      console.log(`Found existing gist with ${subscriptions.length} subscriptions, gistId: ${gistId}`);
    } catch (error) {
      console.log('No existing subscriptions found, will create new gist:', error.message);
    }
    
    // Add new subscription (with simple deduplication by endpoint)
    const existingIndex = subscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
    
    if (existingIndex >= 0) {
      // Update existing subscription
      console.log('Updating existing subscription');
      subscriptions[existingIndex] = {
        ...subscription,
        id: subscriptions[existingIndex].id,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new subscription
      console.log('Adding new subscription');
      const subscriptionId = Date.now().toString();
      subscription.id = subscriptionId;
      subscription.addedAt = new Date().toISOString();
      subscriptions.push(subscription);
    }
    
    console.log(`Total subscriptions after update: ${subscriptions.length}`);
    
    // Save back to GitHub Gist
    const gistResult = await saveSubscriptionsToGist(subscriptions, gistId);
    console.log(`Gist saved successfully: ${gistResult.html_url}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        subscriptionId: subscription.id,
        totalSubscribers: subscriptions.length,
        message: 'Subscription saved successfully',
        storage: 'GitHub Gist',
        gistUrl: gistResult.html_url
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

// Get subscriptions from GitHub Gist
async function getSubscriptionsFromGist() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  // First, try to find existing gist
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
  console.log(`Found ${gists.length} total gists`);
  
  // Look for the subscription gist - be more specific in our search
  const deadPoolGist = gists.find(gist => {
    const hasSubscriptionFile = gist.files && gist.files['dead-pool-subscriptions.json'];
    const hasCorrectDescription = gist.description === 'Dead Pool Notification Subscriptions';
    console.log(`Checking gist ${gist.id}: hasFile=${!!hasSubscriptionFile}, hasDescription=${hasCorrectDescription}`);
    return hasSubscriptionFile && hasCorrectDescription;
  });

  if (!deadPoolGist) {
    console.log('No matching gist found');
    return { subscriptions: [], gistId: null };
  }

  console.log(`Found matching gist: ${deadPoolGist.id}`);

  // Get the gist content
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
  
  const subscriptions = JSON.parse(fileContent);
  console.log(`Loaded ${subscriptions.length} subscriptions from gist`);
  
  return {
    subscriptions: subscriptions,
    gistId: deadPoolGist.id
  };
}

// Save subscriptions to GitHub Gist
async function saveSubscriptionsToGist(subscriptions, gistId) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  const gistData = {
    description: 'Dead Pool Notification Subscriptions',
    public: false,
    files: {
      'dead-pool-subscriptions.json': {
        content: JSON.stringify(subscriptions, null, 2)
      },
      'README.md': {
        content: `# Dead Pool Subscriptions\n\nLast updated: ${new Date().toISOString()}\nTotal subscribers: ${subscriptions.length}\n\nThis gist stores push notification subscriptions for the Dead Pool app.`
      }
    }
  };

  const url = gistId 
    ? `https://api.github.com/gists/${gistId}`
    : 'https://api.github.com/gists';
  
  const method = gistId ? 'PATCH' : 'POST';
  
  console.log(`${method} to GitHub API: ${url}`);

  const response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gistData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`GitHub API error: ${response.status} - ${errorText}`);
    throw new Error(`Failed to save to GitHub Gist: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`Gist ${method === 'POST' ? 'created' : 'updated'} successfully`);
  
  return result;
}
