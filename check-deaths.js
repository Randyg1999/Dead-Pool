// Scheduled function to check for celebrity deaths and send notifications

const players = [
	{ playerName: 'Alanna', qid: 'Q6176881', round: 1 },
	{ playerName: 'Alanna', qid: 'Q456321', round: 2 },
	{ playerName: 'Alanna', qid: 'Q41163', round: 3 },
	{ playerName: 'Alanna', qid: 'Q468635', round: 4 },
	{ playerName: 'Alanna', qid: 'Q10479', round: 5 },
	{ playerName: 'Alanna', qid: 'Q720027', round: 6 },
	{ playerName: 'Alanna', qid: 'Q41142', round: 7 },
	{ playerName: 'Alanna', qid: 'Q42930', round: 8 },
	{ playerName: 'Alanna', qid: 'Q470153', round: 9 },
	{ playerName: 'Alanna', qid: 'Q529294', round: 10 },
	{ playerName: 'Alanna', qid: 'Q320073', round: 11 },
	{ playerName: 'Alanna', qid: 'Q234128', round: 12 },
	{ playerName: 'Alanna', qid: 'Q44329', round: 13 },
	{ playerName: 'Alanna', qid: 'Q232059', round: 14 },
	// Add other players here - copying from contestants.js
];

exports.handler = async (event, context) => {
  console.log('Death check started at:', new Date().toISOString());
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Check for new deaths
    const newDeaths = await checkForNewDeaths();
    
    if (newDeaths.length > 0) {
      console.log('New deaths found:', newDeaths.length);
      
      // Send notifications for each new death
      for (const death of newDeaths) {
        await sendDeathNotification(death);
      }
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Found ${newDeaths.length} new deaths`,
          deaths: newDeaths,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      console.log('No new deaths found');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'No new deaths found',
          timestamp: new Date().toISOString()
        })
      };
    }
    
  } catch (error) {
    console.error('Death check error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Death check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Check Wikidata for new deaths
async function checkForNewDeaths() {
  const newDeaths = [];
  
  // Get stored death data (in production, this would come from a database)
  const lastKnownDeaths = await getLastKnownDeaths();
  
  // Check current death status
  const currentDeaths = await fetchCurrentDeaths();
  
  // Compare to find new deaths
  for (const current of currentDeaths) {
    const wasAlreadyDead = lastKnownDeaths.find(known => 
      known.qid === current.qid && known.dateOfDeath
    );
    
    if (current.dateOfDeath && !wasAlreadyDead) {
      newDeaths.push(current);
    }
  }
  
  // Update stored deaths (in production, save to database)
  if (newDeaths.length > 0) {
    await updateStoredDeaths(currentDeaths);
  }
  
  return newDeaths;
}

// Fetch current death status from Wikidata
async function fetchCurrentDeaths() {
  const API_URL = 'https://www.wikidata.org/w/api.php';
  const BATCH_SIZE = 20;
  let allData = [];
  
  for (let i = 0; i < players.length; i += BATCH_SIZE) {
    const batchPlayers = players.slice(i, i + BATCH_SIZE);
    const qids = batchPlayers.map(player => player.qid).join('|');
    const url = `${API_URL}?action=wbgetentities&ids=${qids}&format=json&origin=*`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const batchData = batchPlayers.map(player => {
        const entity = data.entities[player.qid];
        if (!entity) return null;
        
        const name = getLabel(entity);
        const dateOfDeath = entity.claims.P570 ? 
          formatDate(entity.claims.P570[0].mainsnak.datavalue.value.time) : null;
        
        return {
          qid: player.qid,
          playerName: player.playerName,
          round: player.round,
          name: name,
          dateOfDeath: dateOfDeath
        };
      }).filter(Boolean);
      
      allData = allData.concat(batchData);
      
    } catch (error) {
      console.error('Error fetching batch:', error);
    }
  }
  
  return allData;
}

// Get label from Wikidata entity
function getLabel(entity) {
  if (entity.labels) {
    if (entity.labels.en) return entity.labels.en.value;
    if (entity.labels.mul) return entity.labels.mul.value;
    const firstLang = Object.keys(entity.labels)[0];
    return entity.labels[firstLang].value;
  }
  return 'Unknown';
}

// Format Wikidata date
function formatDate(rawDate) {
  if (!rawDate) return null;
  const dateRegex = /^\+(\d+)-(\d+)-(\d+)T/;
  const match = rawDate.match(dateRegex);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month, day));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

// Get last known deaths (stub - in production use database)
async function getLastKnownDeaths() {
  // For now, return empty array - this would normally fetch from database
  // In production, you'd store death data in Netlify's KV storage or external DB
  return [];
}

// Update stored deaths (stub - in production use database)
async function updateStoredDeaths(deaths) {
  // Store updated death data
  console.log('Would update stored deaths:', deaths.length);
  // In production: save to database/storage
}

// Send notification about a death
async function sendDeathNotification(death) {
  try {
    // Call the send-notification function
    const notificationResponse = await fetch(`${process.env.URL}/.netlify/functions/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '💀 Dead Pool Alert!',
        body: `${death.name} has died! Check your standings.`,
        playerName: death.playerName,
        celebrityName: death.name,
        dateOfDeath: death.dateOfDeath
      })
    });
    
    if (!notificationResponse.ok) {
      throw new Error('Failed to send notification');
    }
    
    console.log('Notification sent for:', death.name);
    
  } catch (error) {
    console.error('Failed to send notification for', death.name, ':', error);
  }
}
