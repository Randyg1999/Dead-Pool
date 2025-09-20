// Step-by-step test to find where it crashes

// Small test array - just 3 celebrities
const testPlayers = [
  { playerName: 'Alanna', qid: 'Q6176881', round: 1 },
  { playerName: 'Alanna', qid: 'Q456321', round: 2 },
  { playerName: 'Alanna', qid: 'Q41163', round: 3 }
];

exports.handler = async (event, context) => {
  console.log('Step-by-step test started');
  
  try {
    // Step 1: Test array access
    const playerCount = testPlayers.length;
    console.log('Step 1 passed: Array has', playerCount, 'players');
    
    // Step 2: Test simple fetch
    const response = await fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q6176881&format=json&origin=*');
    console.log('Step 2 passed: Fetch response status', response.status);
    
    // Step 3: Test JSON parsing
    const data = await response.json();
    console.log('Step 3 passed: JSON parsed successfully');
    
    // Step 4: Test entity access
    const entity = data.entities.Q6176881;
    const name = entity.labels?.en?.value || 'Unknown';
    console.log('Step 4 passed: Name is', name);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'All steps passed!',
        playerCount: playerCount,
        testName: name,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error at step:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Step failed',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
