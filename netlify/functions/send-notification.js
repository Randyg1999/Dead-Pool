// Function to send push notifications to all subscribers using GitHub Gist storage

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { title, body, playerName, celebrityName, dateOfDeath } = JSON.parse(event.body);
    
    console.log('Sending notification:', { title, body, playerName, celebrityName });
    
    // Get subscriptions from GitHub Gist
    let allSubscriptions = [];
    
    try {
      const subscriptionData = await getSubscriptionsFromGist();
      allSubscriptions = subscriptionData.subscriptions || [];
    } catch (error) {
      console.log('No subscriptions found in GitHub Gist:', error.message);
    }
    
    if (allSubscriptions.length === 0) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'No subscribers to notify',
          sentCount: 0,
          storage: 'GitHub Gist'
        })
      };
    }

    // Prepare notification payload
    const notificationPayload = {
      title: title || '💀 Dead Pool Alert!',
      body: body || `${celebrityName} has died! Check your standings.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'dead-pool-death',
      requireInteraction: true,
      data: {
        playerName,
        celebrityName,
        dateOfDeath,
        url: '/'
      },
      actions: [
        {
          action: 'view',
          title: 'Check Standings'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    // Send notifications to all subscribers
    let successCount = 0;
    let failureCount = 0;
    
    for (const subscription of allSubscriptions) {
      try {
        await sendPushNotification(subscription, notificationPayload);
        successCount++;
      } catch (error) {
        console.error('Failed to send to subscription:', error);
        failureCount++;
      }
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: `Notifications sent`,
        sentCount: successCount,
        failedCount: failureCount,
        totalSubscribers: allSubscriptions.length,
        storage: 'GitHub Gist',
        notification: {
          title: notificationPayload.title,
          body: notificationPayload.body,
          celebrityName,
          playerName
        }
      })
    };

  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to send notifications',
        message: error.message
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
  const deadPoolGist = gists.find(gist => 
    gist.files['dead-pool-subscriptions.json'] || 
    gist.description === 'Dead Pool Notification Subscriptions'
  );

  if (!deadPoolGist) {
    return { subscriptions: [], gistId: null };
  }

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
  
  return {
    subscriptions: JSON.parse(fileContent),
    gistId: deadPoolGist.id
  };
}

// Send push notification using Web Push Protocol (simplified)
async function sendPushNotification(subscription, payload) {
  const notificationData = JSON.stringify(payload);
  
  try {
    // This is a simplified version for testing
    // In production, you'd use proper VAPID authentication and web-push library
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'aesgcm',
        'TTL': '86400' // 24 hours
      },
      body: notificationData
    });

    if (!response.ok) {
      throw new Error(`Push service responded with ${response.status}`);
    }

    console.log('Push notification sent successfully');
    return true;

  } catch (error) {
    console.error('Push notification failed:', error);
    throw error;
  }
}
