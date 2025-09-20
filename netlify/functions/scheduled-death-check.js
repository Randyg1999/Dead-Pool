// Scheduled function that runs automatically every 6 hours
// File naming convention for Netlify scheduled functions

exports.handler = async (event, context) => {
  console.log('Scheduled death check running at:', new Date().toISOString());
  
  try {
    // Import the check-deaths logic
    const checkDeaths = require('./check-deaths');
    
    // Run the death check
    const result = await checkDeaths.handler(event, context);
    
    console.log('Scheduled check completed:', result.statusCode);
    return result;
    
  } catch (error) {
    console.error('Scheduled check failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Scheduled check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Schedule: every 6 hours
exports.schedule = "0 */6 * * *";
