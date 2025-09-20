// Scheduled function to check for celebrity deaths and send notifications
// Dynamically fetches celebrity data from contestants.js

exports.handler = async (event, context) => {
  console.log('Death check started at:', new Date().toISOString());
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Fetch current celebrity data from live contestants.js
    const players = await fetchLivePlayerData();
    console.log(`Loaded ${players.length} celebrities from contestants.js`);
    
    // Check for new deaths
    const newDeaths = await checkForNewDeaths(players);
    
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
          totalCelebritiesChecked: players.length,
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
          totalCelebritiesChecked: players.length,
          debug: {
            playersLoaded: players.length,
            currentDeathsFound: newDeaths.length,
            lastKnownDeathsCount: (await getLastKnownDeaths()).length,
            sampleCurrentDeaths: (await fetchCurrentDeaths(players)).slice(0, 3).map(d => ({ 
              name: d.name, 
              dateOfDeath: d.dateOfDeath 
            }))
          },
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

// Fetch live player data from contestants.js
async function fetchLivePlayerData() {
  try {
    // Construct the URL to contestants.js on the live site
    const baseUrl = process.env.URL || 'https://dirty-oar-dead-pool.netlify.app';
    const contestantsUrl = `${baseUrl}/contestants.js`;
    
    console.log('Fetching player data from:', contestantsUrl);
    
    const response = await fetch(contestantsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch contestants.js: ${response.status}`);
    }
    
    const jsContent = await response.text();
    
    // Extract the players array from the JavaScript file
    const players = parsePlayersFromJS(jsContent);
    
    if (!players || players.length === 0) {
      throw new Error('No players found in contestants.js');
    }
    
    return players;
    
  } catch (error) {
    console.error('Error fetching live player data:', error);
    throw new Error(`Failed to load celebrity data: ${error.message}`);
  }
}

// Parse the players array from contestants.js content
function parsePlayersFromJS(jsContent) {
  try {
    // Find the players array in the JavaScript content
    const playersMatch = jsContent.match(/const players\s*=\s*(\[[\s\S]*?\]);/);
    
    if (!playersMatch) {
      throw new Error('Could not find players array in contestants.js');
    }
    
    const playersArrayString = playersMatch[1];
    
    // Safely evaluate the JavaScript array
    // Note: This is safe because we control the source
    const players = eval(`(${playersArrayString})`);
    
    return players;
    
  } catch (error) {
    console.error('Error parsing players from JS:', error);
    throw new Error(`Failed to parse players array: ${error.message}`);
  }
}

// Check Wikidata for new deaths
async function checkForNewDeaths(players) {
  const newDeaths = [];
  
  // Get stored death data (in production, this would come from a database)
  const lastKnownDeaths = await getLastKnownDeaths();
  
  // Check current death status
  const currentDeaths = await fetchCurrentDeaths(players);
  
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
async function fetchCurrentDeaths(players) {
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
    const baseUrl = process.env.URL || 'https://dirty-oar-dead-pool.netlify.app';
    
    // Call the send-notification function
    const notificationResponse = await fetch(`${baseUrl}/.netlify/functions/send-notification`, {
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
