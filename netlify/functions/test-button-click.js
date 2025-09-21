// Simple test function to check if button clicks work

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/html'
  };

  const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Button Click Test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Button Click Test</h1>
    
    <button id="notifyButton" style="padding: 20px; font-size: 18px; background: blue; color: white; border: none; border-radius: 5px;">
        <span class="btn-icon">🔔</span>
        <span class="btn-text">Test Notification Button</span>
    </button>
    
    <div id="notifyStatus" style="margin: 20px 0; padding: 10px; background: #f0f0f0;"></div>
    
    <div id="logs" style="margin: 20px 0; padding: 10px; background: #000; color: #0f0; font-family: monospace; white-space: pre-wrap;"></div>

    <script>
      const logDiv = document.getElementById('logs');
      
      function log(message) {
        console.log(message);
        logDiv.textContent += new Date().toLocaleTimeString() + ': ' + message + '\\n';
      }
      
      document.addEventListener('DOMContentLoaded', () => {
        log('✅ DOM loaded');
        
        const subscribeBtn = document.getElementById('notifyButton');
        const statusDiv = document.getElementById('notifyStatus');
        
        if (!subscribeBtn) {
          log('❌ Button not found!');
          return;
        }
        
        log('✅ Button found');
        
        subscribeBtn.addEventListener('click', async () => {
          log('🔔 Button clicked!');
          statusDiv.textContent = 'Button was clicked!';
          
          try {
            log('📋 Requesting notification permission...');
            const permission = await Notification.requestPermission();
            log('📋 Permission result: ' + permission);
            statusDiv.textContent = 'Permission: ' + permission;
            
            if (permission === 'granted') {
              log('🧪 Sending test notification...');
              new Notification('Test Notification', {
                body: 'This is a test notification!',
                icon: '/favicon.ico'
              });
              log('✅ Test notification sent');
            }
            
          } catch (error) {
            log('❌ Error: ' + error.message);
            statusDiv.textContent = 'Error: ' + error.message;
          }
        });
        
        log('✅ Event listener attached');
      });
    </script>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers,
    body: testHTML
  };
};
