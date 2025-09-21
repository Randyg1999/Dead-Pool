  // Handle subscription button click
  async function handleSubscriptionClick() {
    const subscribeBtn = document.getElementById('notifyButton');
    const statusDiv = document.getElementById('notifyStatus');

    try {
      console.log('🔔 Starting subscription process...');
      subscribeBtn.disabled = true;
      statusDiv.textContent = 'Requesting permission...';
      statusDiv.className = 'notify-status info';

      // Request notification permission
      console.log('📋 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('📋 Permission result:', permission);

      if (permission === 'granted') {
        console.log('✅ Permission granted, registering service worker...');
        
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        console.log('🔑 Fetching VAPID keys...');
        // Get VAPID public key from server
        const vapidResponse = await fetch('/.netlify/functions/vapid-keys');
        console.log('🔑 VAPID response status:', vapidResponse.status);
        
        const vapidData = await vapidResponse.json();
        console.log('🔑 VAPID data received:', vapidData);
        
        if (!vapidData.success || !vapidData.keys.publicKey) {
          throw new Error('Invalid VAPID response: ' + JSON.stringify(vapidData));
        }
        
        console.log('📱 Creating push subscription...');
        // Subscribe to push notifications with server's VAPID key
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidData.keys.publicKey)
        });
        console.log('📱 Push subscription created:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          hasKeys: !!subscription.keys
        });

        console.log('💾 Sending subscription to server...');
        // Send subscription to server
        await sendSubscriptionToServer(subscription);
        console.log('✅ Subscription saved to server');
        
        console.log('🧪 Sending test notification...');
        // Send test notification to confirm it works
        await sendTestNotification();
        console.log('✅ Test notification sent');

        updateNotificationUI();
        console.log('🎉 Subscription process completed successfully!');
      } else {
        console.log('❌ Permission denied or dismissed');
        updateNotificationUI();
      }
    } catch (error) {
      console.error('💥 Error in subscription process:', error);
      console.error('💥 Error stack:', error.stack);
      statusDiv.textContent = 'Failed to enable notifications: ' + error.message;
      statusDiv.className = 'notify-status error';
      subscribeBtn.disabled = false;
    }
  }

  // Send subscription to server
  async function sendSubscriptionToServer(subscription) {
    try {
      console.log('📤 Posting subscription to /subscribe function...');
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      console.log('📤 Subscribe function response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📤 Subscribe function error response:', errorText);
        throw new Error(`Failed to save subscription: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📤 Subscribe function success response:', result);

    } catch (error) {
      console.error('📤 Error saving subscription:', error);
      throw error;
    }
  }

  // Send test notification
  async function sendTestNotification() {
    try {
      console.log('🧪 Sending test notification...');
      const response = await fetch('/.netlify/functions/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '💀 Dead Pool Test',
          body: 'Push notifications are working! You\'ll be alerted when someone dies.',
          test: true
        })
      });

      console.log('🧪 Test notification response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('🧪 Test notification failed:', errorText);
      } else {
        const result = await response.json();
        console.log('🧪 Test notification result:', result);
      }
    } catch (error) {
      console.warn('🧪 Test notification error:', error);
    }
  }
