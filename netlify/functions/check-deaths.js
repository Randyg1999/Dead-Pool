// Simplified death checker - temporarily using hardcoded data until we fix dynamic loading

// For now, let's use the known working approach with hardcoded celebrity list
// We can add dynamic loading back once this basic version works

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
	{ playerName: 'Alanna', qid: 'Q316712', round: 15 },
	{ playerName: 'Alanna', qid: 'Q741473', round: 16 },
	{ playerName: 'Alanna', qid: 'Q111443057', round: 17 },
	{ playerName: 'Alanna', qid: 'Q358990', round: 18 },
	{ playerName: 'Alanna', qid: 'Q549242', round: 19 },
	{ playerName: 'Alanna', qid: 'Q7816923', round: 20 },
	{ playerName: 'Alanna', qid: 'Q3637131', round: 21 },
	{ playerName: 'Alanna', qid: 'Q1209818', round: 22 },
	{ playerName: 'Alanna', qid: 'Q22073413', round: 23 },
	{ playerName: 'Alanna', qid: 'Q57272', round: 24 },
	{ playerName: 'Alanna', qid: 'Q171905', round: 25 },
	{ playerName: 'Amanda', qid: 'Q104266', round: 1 },
	{ playerName: 'Amanda', qid: 'Q2252', round: 2 },
	{ playerName: 'Amanda', qid: 'Q206112', round: 3 },
	{ playerName: 'Amanda', qid: 'Q259536', round: 4 },
	{ playerName: 'Amanda', qid: 'Q157054', round: 5 },
	{ playerName: 'Amanda', qid: 'Q117012', round: 6 },
	{ playerName: 'Amanda', qid: 'Q2320305', round: 7 },
	{ playerName: 'Amanda', qid: 'Q39792', round: 8 },
	{ playerName: 'Amanda', qid: 'Q131285', round: 9 },
	{ playerName: 'Amanda', qid: 'Q321280', round: 10 },
	{ playerName: 'Amanda', qid: 'Q1111542', round: 11 },
	{ playerName: 'Amanda', qid: 'Q344977', round: 12 },
	{ playerName: 'Amanda', qid: 'Q6279', round: 13 },
	{ playerName: 'Amanda', qid: 'Q130088', round: 14 },
	{ playerName: 'Amanda', qid: 'Q370181', round: 15 },
	{ playerName: 'Amanda', qid: 'Q888295', round: 16 },
	{ playerName: 'Amanda', qid: 'Q171736', round: 17 },
	{ playerName: 'Amanda', qid: 'Q711892', round: 18 },
	{ playerName: 'Amanda', qid: 'Q255378', round: 19 },
	{ playerName: 'Amanda', qid: 'Q83688347', round: 20 },
	{ playerName: 'Amanda', qid: 'Q12908', round: 21 },
	{ playerName: 'Amanda', qid: 'Q44479972', round: 22 },
	{ playerName: 'Amanda', qid: 'Q2907947', round: 23 },
	{ playerName: 'Amanda', qid: 'Q302762', round: 24 },
	{ playerName: 'Amanda', qid: 'Q774414', round: 25 },
	{ playerName: 'Becky', qid: 'Q395274', round: 1 },
	{ playerName: 'Becky', qid: 'Q52392', round: 2 },
	{ playerName: 'Becky', qid: 'Q465632', round: 3 },
	{ playerName: 'Becky', qid: 'Q442250', round: 4 },
	{ playerName: 'Becky', qid: 'Q14441', round: 5 },
	{ playerName: 'Becky', qid: 'Q95026', round: 6 },
	{ playerName: 'Becky', qid: 'Q235989', round: 7 },
	{ playerName: 'Becky', qid: 'Q150943', round: 8 },
	{ playerName: 'Becky', qid: 'Q152843', round: 9 },
	{ playerName: 'Becky', qid: 'Q462925', round: 10 },
	{ playerName: 'Becky', qid: 'Q312782', round: 11 },
	{ playerName: 'Becky', qid: 'Q144622', round: 12 },
	{ playerName: 'Becky', qid: 'Q191084', round: 13 },
	{ playerName: 'Becky', qid: 'Q25089', round: 14 },
	{ playerName: 'Becky', qid: 'Q28054', round: 15 },
	{ playerName: 'Becky', qid: 'Q232298', round: 16 },
	{ playerName: 'Becky', qid: 'Q2053337', round: 17 },
	{ playerName: 'Becky', qid: 'Q3874799', round: 18 },
	{ playerName: 'Becky', qid: 'Q665358', round: 19 },
	{ playerName: 'Becky', qid: 'Q392', round: 20 },
	{ playerName: 'Becky', qid: 'Q234478', round: 21 },
	{ playerName: 'Becky', qid: 'Q174908', round: 22 },
	{ playerName: 'Becky', qid: 'Q504455', round: 23 },
	{ playerName: 'Becky', qid: 'Q537747', round: 24 },
	{ playerName: 'Becky', qid: 'Q59215', round: 25 },
	{ playerName: 'Brett', qid: 'Q43274', round: 1 },
	{ playerName: 'Brett', qid: 'Q450675', round: 2 },
	{ playerName: 'Brett', qid: 'Q355522', round: 3 },
	{ playerName: 'Brett', qid: 'Q131411648', round: 4 },
	{ playerName: 'Brett', qid: 'Q1355840', round: 5 },
	{ playerName: 'Brett', qid: 'Q56057107', round: 6 },
	{ playerName: 'Brett', qid: 'Q329807', round: 7 },
	{ playerName: 'Brett', qid: 'Q123351', round: 8 },
	{ playerName: 'Brett', qid: 'Q7105915', round: 9 },
	{ playerName: 'Brett', qid: 'Q7747', round: 10 },
	{ playerName: 'Brett', qid: 'Q65932', round: 11 },
	{ playerName: 'Brett', qid: 'Q919527', round: 12 },
	{ playerName: 'Brett', qid: 'Q189599', round: 13 },
	{ playerName: 'Brett', qid: 'Q134183', round: 14 },
	{ playerName: 'Brett', qid: 'Q234086', round: 15 },
	{ playerName: 'Brett', qid: 'Q352717', round: 16 },
	{ playerName: 'Brett', qid: 'Q287607', round: 17 },
	{ playerName: 'Brett', qid: 'Q6294', round: 18 },
	{ playerName: 'Brett', qid: 'Q1329372', round: 19 },
	{ playerName: 'Brett', qid: 'Q5556756', round: 20 },
	{ playerName: 'Brett', qid: 'Q229271', round: 21 },
	{ playerName: 'Brett', qid: 'Q380433', round: 22 },
	{ playerName: 'Brett', qid: 'Q43723', round: 23 },
	{ playerName: 'Brett', qid: 'Q467519', round: 24 },
	{ playerName: 'Brett', qid: 'Q6211962', round: 25 },
	{ playerName: 'Julie_E', qid: 'Q228928', round: 1 },
	{ playerName: 'Julie_E', qid: 'Q7172170', round: 2 },
	{ playerName: 'Julie_E', qid: 'Q391437', round: 3 },
	{ playerName: 'Julie_E', qid: 'Q2066705', round: 4 },
	{ playerName: 'Julie_E', qid: 'Q2513293', round: 5 },
	{ playerName: 'Julie_E', qid: 'Q193635', round: 6 },
	{ playerName: 'Julie_E', qid: 'Q16193271', round: 7 },
	{ playerName: 'Julie_E', qid: 'Q291309', round: 8 },
	{ playerName: 'Julie_E', qid: 'Q1601558', round: 9 },
	{ playerName: 'Julie_E', qid: 'Q9049', round: 10 },
	{ playerName: 'Julie_E', qid: 'Q7417254', round: 11 },
	{ playerName: 'Julie_E', qid: 'Q7177', round: 12 },
	{ playerName: 'Julie_E', qid: 'Q299208', round: 13 },
	{ playerName: 'Julie_E', qid: 'Q142546', round: 14 },
	{ playerName: 'Julie_E', qid: 'Q285536', round: 15 },
	{ playerName: 'Julie_E', qid: 'Q505274', round: 16 },
	{ playerName: 'Julie_E', qid: 'Q6308207', round: 17 },
	{ playerName: 'Julie_E', qid: 'Q271348', round: 18 },
	{ playerName: 'Julie_E', qid: 'Q183337', round: 19 },
	{ playerName: 'Julie_E', qid: 'Q311132', round: 20 },
	{ playerName: 'Julie_E', qid: 'Q297275', round: 21 },
	{ playerName: 'Julie_E', qid: 'Q172724', round: 22 },
	{ playerName: 'Julie_E', qid: 'Q337375', round: 23 },
	{ playerName: 'Julie_E', qid: 'Q1101938', round: 24 },
	{ playerName: 'Julie_E', qid: 'Q553436', round: 25 },
	{ playerName: 'Julie_L', qid: 'Q310295', round: 1 },
	{ playerName: 'Julie_L', qid: 'Q43203', round: 2 },
	{ playerName: 'Julie_L', qid: 'Q111240', round: 3 },
	{ playerName: 'Julie_L', qid: 'Q313392', round: 4 },
	{ playerName: 'Julie_L', qid: 'Q16297', round: 5 },
	{ playerName: 'Julie_L', qid: 'Q618233', round: 6 },
	{ playerName: 'Julie_L', qid: 'Q110154', round: 7 },
	{ playerName: 'Julie_L', qid: 'Q170510', round: 8 },
	{ playerName: 'Julie_L', qid: 'Q53944', round: 9 },
	{ playerName: 'Julie_L', qid: 'Q255565', round: 10 },
	{ playerName: 'Julie_L', qid: 'Q48337', round: 11 },
	{ playerName: 'Julie_L', qid: 'Q733027', round: 12 },
	{ playerName: 'Julie_L', qid: 'Q273055', round: 13 },
	{ playerName: 'Julie_L', qid: 'Q310493', round: 14 },
	{ playerName: 'Julie_L', qid: 'Q47213', round: 15 },
	{ playerName: 'Julie_L', qid: 'Q295847', round: 16 },
	{ playerName: 'Julie_L', qid: 'Q299483', round: 17 },
	{ playerName: 'Julie_L', qid: 'Q36970', round: 18 },
	{ playerName: 'Julie_L', qid: 'Q726335', round: 19 },
	{ playerName: 'Julie_L', qid: 'Q552806', round: 20 },
	{ playerName: 'Julie_L', qid: 'Q4974067', round: 21 },
	{ playerName: 'Julie_L', qid: 'Q234695', round: 22 },
	{ playerName: 'Julie_L', qid: 'Q184746', round: 23 },
	{ playerName: 'Julie_L', qid: 'Q456055', round: 24 },
	{ playerName: 'Julie_L', qid: 'Q231484', round: 25 },
	{ playerName: 'Randy', qid: 'Q22686', round: 1 },
	{ playerName: 'Randy', qid: 'Q218718', round: 2 },
	{ playerName: 'Randy', qid: 'Q16296', round: 3 },
	{ playerName: 'Randy', qid: 'Q211082', round: 4 },
	{ playerName: 'Randy', qid: 'Q187033', round: 5 },
	{ playerName: 'Randy', qid: 'Q312081', round: 6 },
	{ playerName: 'Randy', qid: 'Q18097962', round: 7 },
	{ playerName: 'Randy', qid: 'Q194045', round: 8 },
	{ playerName: 'Randy', qid: 'Q56226', round: 9 },
	{ playerName: 'Randy', qid: 'Q503013', round: 10 },
	{ playerName: 'Randy', qid: 'Q170581', round: 11 },
	{ playerName: 'Randy', qid: 'Q15935', round: 12 },
	{ playerName: 'Randy', qid: 'Q161819', round: 13 },
	{ playerName: 'Randy', qid: 'Q455880', round: 14 },
	{ playerName: 'Randy', qid: 'Q355130', round: 15 },
	{ playerName: 'Randy', qid: 'Q319121', round: 16 },
	{ playerName: 'Randy', qid: 'Q39829', round: 17 },
	{ playerName: 'Randy', qid: 'Q103939', round: 18 },
	{ playerName: 'Randy', qid: 'Q44546', round: 19 },
	{ playerName: 'Randy', qid: 'Q1378213', round: 20 },
	{ playerName: 'Randy', qid: 'Q128121', round: 21 },
	{ playerName: 'Randy', qid: 'Q48259', round: 22 },
	{ playerName: 'Randy', qid: 'Q310394', round: 23 },
	{ playerName: 'Randy', qid: 'Q454088', round: 24 },
	{ playerName: 'Randy', qid: 'Q42869', round: 25 },
	{ playerName: 'Shawn', qid: 'Q216936', round: 1 },
	{ playerName: 'Shawn', qid: 'Q133151', round: 2 },
	{ playerName: 'Shawn', qid: 'Q2680', round: 3 },
	{ playerName: 'Shawn', qid: 'Q178552', round: 4 },
	{ playerName: 'Shawn', qid: 'Q1173157', round: 5 },
	{ playerName: 'Shawn', qid: 'Q188280', round: 6 },
	{ playerName: 'Shawn', qid: 'Q44430', round: 7 },
	{ playerName: 'Shawn', qid: 'Q2808', round: 8 },
	{ playerName: 'Shawn', qid: 'Q2685', round: 9 },
	{ playerName: 'Shawn', qid: 'Q11975', round: 10 },
	{ playerName: 'Shawn', qid: 'Q531599', round: 11 },
	{ playerName: 'Shawn', qid: 'Q213512', round: 12 },
	{ playerName: 'Shawn', qid: 'Q79031', round: 13 },
	{ playerName: 'Shawn', qid: 'Q221289', round: 14 },
	{ playerName: 'Shawn', qid: 'Q170587', round: 15 },
	{ playerName: 'Shawn', qid: 'Q232541', round: 16 },
	{ playerName: 'Shawn', qid: 'Q449612', round: 17 },
	{ playerName: 'Shawn', qid: 'Q51552', round: 18 },
	{ playerName: 'Shawn', qid: 'Q6184378', round: 19 },
	{ playerName: 'Shawn', qid: 'Q7407424', round: 20 },
	{ playerName: 'Shawn', qid: 'Q319099', round: 21 },
	{ playerName: 'Shawn', qid: 'Q259998', round: 22 },
	{ playerName: 'Shawn', qid: 'Q355288', round: 23 },
	{ playerName: 'Shawn', qid: 'Q36268', round: 24 },
	{ playerName: 'Shawn', qid: 'Q5105', round: 25 }
];

exports.handler = async (event, context) => {
  console.log('Death check started at:', new Date().toISOString());
  console.log(`Checking ${players.length} celebrities`);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Check current death status
    const currentDeaths = await fetchCurrentDeaths(players);
    console.log(`Fetched data for ${currentDeaths.length} celebrities`);
    
    // Filter for those who have died
    const deadCelebrities = currentDeaths.filter(d => d.dateOfDeath);
    console.log(`Found ${deadCelebrities.length} dead celebrities:`, 
      deadCelebrities.map(d => `${d.name} (${d.dateOfDeath})`));
    
    // Since we have no persistent storage yet, ALL deaths are "new" 
    // This should trigger notifications for all 16 deaths
    const newDeaths = deadCelebrities;
    
    if (newDeaths.length > 0) {
      console.log(`Sending notifications for ${newDeaths.length} deaths`);
      
      // Send notifications for each death
      for (const death of newDeaths) {
        await sendDeathNotification(death);
      }
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Found ${newDeaths.length} deaths - notifications sent!`,
          deaths: newDeaths.map(d => ({ name: d.name, player: d.playerName, date: d.dateOfDeath })),
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'No deaths found',
          totalChecked: players.length,
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

// Send notification about a death
async function sendDeathNotification(death) {
  try {
    const baseUrl = process.env.URL || 'https://dirty-oar-dead-pool.netlify.app';
    
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
