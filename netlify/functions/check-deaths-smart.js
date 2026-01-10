// Enhanced death checker that tracks previously notified deaths

const players = [
	{ playerName: 'Alanna', qid: 'Q7612664', round: 1 },
	{ playerName: 'Alanna', qid: 'Q553063', round: 2 },
	{ playerName: 'Alanna', qid: 'Q14950157', round: 3 },
	{ playerName: 'Alanna', qid: 'Q311132', round: 4 },
	{ playerName: 'Alanna', qid: 'Q310295', round: 5 },
	{ playerName: 'Alanna', qid: 'Q733027', round: 6 },
	{ playerName: 'Alanna', qid: 'Q232541', round: 7 },
	{ playerName: 'Alanna', qid: 'Q711892', round: 8 },
	{ playerName: 'Alanna', qid: 'Q213512', round: 9 },
	{ playerName: 'Alanna', qid: 'Q5105', round: 10 },
	{ playerName: 'Alanna', qid: 'Q144622', round: 11 },
	{ playerName: 'Alanna', qid: 'Q6778088', round: 12 },
	{ playerName: 'Alanna', qid: 'Q721948', round: 13 },
	{ playerName: 'Alanna', qid: 'Q4636', round: 14 },
	{ playerName: 'Alanna', qid: 'Q7032653', round: 15 },
	{ playerName: 'Alanna', qid: 'Q527834', round: 16 },
	{ playerName: 'Alanna', qid: 'Q1209818', round: 17 },
	{ playerName: 'Alanna', qid: 'Q950128', round: 18 },
	{ playerName: 'Alanna', qid: 'Q7407424', round: 19 },
	{ playerName: 'Alanna', qid: 'Q5120493', round: 20 },
	{ playerName: 'Alanna', qid: 'Q4237307', round: 21 },
	{ playerName: 'Alanna', qid: 'Q232059', round: 22 },
	{ playerName: 'Alanna', qid: 'Q131330558', round: 23 },
	{ playerName: 'Alanna', qid: 'Q319585', round: 24 },
	{ playerName: 'Alanna', qid: 'Q2165437', round: 25 },
	{ playerName: 'Amanda', qid: 'Q183337', round: 1 },
	{ playerName: 'Amanda', qid: 'Q1747993', round: 2 },
	{ playerName: 'Amanda', qid: 'Q2680', round: 3 },
	{ playerName: 'Amanda', qid: 'Q774414', round: 4 },
	{ playerName: 'Amanda', qid: 'Q310926', round: 5 },
	{ playerName: 'Amanda', qid: 'Q206112', round: 6 },
	{ playerName: 'Amanda', qid: 'Q130088', round: 7 },
	{ playerName: 'Amanda', qid: 'Q39792', round: 8 },
	{ playerName: 'Amanda', qid: 'Q131285', round: 9 },
	{ playerName: 'Amanda', qid: 'Q321280', round: 10 },
	{ playerName: 'Amanda', qid: 'Q395274', round: 11 },
	{ playerName: 'Amanda', qid: 'Q171736', round: 12 },
	{ playerName: 'Amanda', qid: 'Q255378', round: 13 },
	{ playerName: 'Amanda', qid: 'Q6112917', round: 14 },
	{ playerName: 'Amanda', qid: 'Q12908', round: 15 },
	{ playerName: 'Amanda', qid: 'Q48337', round: 16 },
	{ playerName: 'Amanda', qid: 'Q114498066', round: 17 },
	{ playerName: 'Amanda', qid: 'Q123351', round: 18 },
	{ playerName: 'Amanda', qid: 'Q170510', round: 19 },
	{ playerName: 'Amanda', qid: 'Q12003', round: 20 },
	{ playerName: 'Amanda', qid: 'Q708097', round: 21 },
	{ playerName: 'Amanda', qid: 'Q4454611', round: 22 },
	{ playerName: 'Amanda', qid: 'Q36949', round: 23 },
	{ playerName: 'Amanda', qid: 'Q65932', round: 24 },
	{ playerName: 'Amanda', qid: 'Q2599', round: 25 },
	{ playerName: 'Becky', qid: 'Q16192221', round: 1 },
	{ playerName: 'Becky', qid: 'Q104266', round: 2 },
	{ playerName: 'Becky', qid: 'Q465632', round: 3 },
	{ playerName: 'Becky', qid: 'Q95026', round: 4 },
	{ playerName: 'Becky', qid: 'Q711921', round: 5 },
	{ playerName: 'Becky', qid: 'Q22686', round: 6 },
	{ playerName: 'Becky', qid: 'Q3459517', round: 7 },
	{ playerName: 'Becky', qid: 'Q259998', round: 8 },
	{ playerName: 'Becky', qid: 'Q456055', round: 9 },
	{ playerName: 'Becky', qid: 'Q237221', round: 10 },
	{ playerName: 'Becky', qid: 'Q529294', round: 11 },
	{ playerName: 'Becky', qid: 'Q230184', round: 12 },
	{ playerName: 'Becky', qid: 'Q294531', round: 13 },
	{ playerName: 'Becky', qid: 'Q264748', round: 14 },
	{ playerName: 'Becky', qid: 'Q14441', round: 15 },
	{ playerName: 'Becky', qid: 'Q896746', round: 16 },
	{ playerName: 'Becky', qid: 'Q392', round: 17 },
	{ playerName: 'Becky', qid: 'Q453949', round: 18 },
	{ playerName: 'Becky', qid: 'Q927415', round: 19 },
	{ playerName: 'Becky', qid: 'Q202976', round: 20 },
	{ playerName: 'Becky', qid: 'Q167520', round: 21 },
	{ playerName: 'Becky', qid: 'Q133665', round: 22 },
	{ playerName: 'Becky', qid: 'Q229375', round: 23 },
	{ playerName: 'Becky', qid: 'Q233937', round: 24 },
	{ playerName: 'Becky', qid: 'Q355288', round: 25 },
	{ playerName: 'Brett', qid: 'Q43274', round: 1 },
	{ playerName: 'Brett', qid: 'Q7747', round: 2 },
	{ playerName: 'Brett', qid: 'Q467519', round: 3 },
	{ playerName: 'Brett', qid: 'Q6279', round: 4 },
	{ playerName: 'Brett', qid: 'Q58132', round: 5 },
	{ playerName: 'Brett', qid: 'Q355522', round: 6 },
	{ playerName: 'Brett', qid: 'Q618233', round: 7 },
	{ playerName: 'Brett', qid: 'Q329807', round: 8 },
	{ playerName: 'Brett', qid: 'Q273055', round: 9 },
	{ playerName: 'Brett', qid: 'Q170581', round: 10 },
	{ playerName: 'Brett', qid: 'Q6294', round: 11 },
	{ playerName: 'Brett', qid: 'Q3874799', round: 12 },
	{ playerName: 'Brett', qid: 'Q189599', round: 13 },
	{ playerName: 'Brett', qid: 'Q83688347', round: 14 },
	{ playerName: 'Brett', qid: 'Q255565', round: 15 },
	{ playerName: 'Brett', qid: 'Q503013', round: 16 },
	{ playerName: 'Brett', qid: 'Q1124', round: 17 },
	{ playerName: 'Brett', qid: 'Q380433', round: 18 },
	{ playerName: 'Brett', qid: 'Q3181500', round: 19 },
	{ playerName: 'Brett', qid: 'Q44479972', round: 20 },
	{ playerName: 'Brett', qid: 'Q232298', round: 21 },
	{ playerName: 'Brett', qid: 'Q194045', round: 22 },
	{ playerName: 'Brett', qid: 'Q1933507', round: 23 },
	{ playerName: 'Brett', qid: 'Q230138', round: 24 },
	{ playerName: 'Brett', qid: 'Q15615', round: 25 },
	{ playerName: 'Julie_E', qid: 'Q1111542', round: 1 },
	{ playerName: 'Julie_E', qid: 'Q2066705', round: 2 },
	{ playerName: 'Julie_E', qid: 'Q9049', round: 3 },
	{ playerName: 'Julie_E', qid: 'Q285536', round: 4 },
	{ playerName: 'Julie_E', qid: 'Q6308207', round: 5 },
	{ playerName: 'Julie_E', qid: 'Q47213', round: 6 },
	{ playerName: 'Julie_E', qid: 'Q553436', round: 7 },
	{ playerName: 'Julie_E', qid: 'Q1372167', round: 8 },
	{ playerName: 'Julie_E', qid: 'Q2513293', round: 9 },
	{ playerName: 'Julie_E', qid: 'Q337375', round: 10 },
	{ playerName: 'Julie_E', qid: 'Q319099', round: 11 },
	{ playerName: 'Julie_E', qid: 'Q299208', round: 12 },
	{ playerName: 'Julie_E', qid: 'Q1101938', round: 13 },
	{ playerName: 'Julie_E', qid: 'Q53944', round: 14 },
	{ playerName: 'Julie_E', qid: 'Q297275', round: 15 },
	{ playerName: 'Julie_E', qid: 'Q13560481', round: 16 },
	{ playerName: 'Julie_E', qid: 'Q461727', round: 17 },
	{ playerName: 'Julie_E', qid: 'Q80462', round: 18 },
	{ playerName: 'Julie_E', qid: 'Q783369', round: 19 },
	{ playerName: 'Julie_E', qid: 'Q42930', round: 20 },
	{ playerName: 'Julie_E', qid: 'Q1905269', round: 21 },
	{ playerName: 'Julie_E', qid: 'Q3421728', round: 22 },
	{ playerName: 'Julie_E', qid: 'Q236212', round: 23 },
	{ playerName: 'Julie_E', qid: 'Q2685', round: 24 },
	{ playerName: 'Julie_E', qid: 'Q377662', round: 25 },
	{ playerName: 'Julie_L', qid: 'Q313392', round: 1 },
	{ playerName: 'Julie_L', qid: 'Q299421', round: 2 },
	{ playerName: 'Julie_L', qid: 'Q2317740', round: 3 },
	{ playerName: 'Julie_L', qid: 'Q29574', round: 4 },
	{ playerName: 'Julie_L', qid: 'Q117012', round: 5 },
	{ playerName: 'Julie_L', qid: 'Q1066551', round: 6 },
	{ playerName: 'Julie_L', qid: 'Q358990', round: 7 },
	{ playerName: 'Julie_L', qid: 'Q370181', round: 8 },
	{ playerName: 'Julie_L', qid: 'Q310394', round: 9 },
	{ playerName: 'Julie_L', qid: 'Q367825', round: 10 },
	{ playerName: 'Julie_L', qid: 'Q344977', round: 11 },
	{ playerName: 'Julie_L', qid: 'Q391437', round: 12 },
	{ playerName: 'Julie_L', qid: 'Q25089', round: 13 },
	{ playerName: 'Julie_L', qid: 'Q193368', round: 14 },
	{ playerName: 'Julie_L', qid: 'Q46809', round: 15 },
	{ playerName: 'Julie_L', qid: 'Q235622', round: 16 },
	{ playerName: 'Julie_L', qid: 'Q264596', round: 17 },
	{ playerName: 'Julie_L', qid: 'Q455689', round: 18 },
	{ playerName: 'Julie_L', qid: 'Q51552', round: 19 },
	{ playerName: 'Julie_L', qid: 'Q15257', round: 20 },
	{ playerName: 'Julie_L', qid: 'Q726335', round: 21 },
	{ playerName: 'Julie_L', qid: 'Q234195', round: 22 },
	{ playerName: 'Julie_L', qid: 'Q731668', round: 23 },
	{ playerName: 'Julie_L', qid: 'Q4355654', round: 24 },
	{ playerName: 'Julie_L', qid: 'Q919527', round: 25 },
	{ playerName: 'Kent', qid: 'Q310383', round: 1 },
	{ playerName: 'Kent', qid: 'Q44546', round: 2 },
	{ playerName: 'Kent', qid: 'Q2252', round: 3 },
	{ playerName: 'Kent', qid: 'Q6184378', round: 4 },
	{ playerName: 'Kent', qid: 'Q531599', round: 5 },
	{ playerName: 'Kent', qid: 'Q296641', round: 6 },
	{ playerName: 'Kent', qid: 'Q110154', round: 7 },
	{ playerName: 'Kent', qid: 'Q136465392', round: 8 },
	{ playerName: 'Kent', qid: 'Q355130', round: 9 },
	{ playerName: 'Kent', qid: 'Q529207', round: 10 },
	{ playerName: 'Kent', qid: 'Q302762', round: 11 },
	{ playerName: 'Kent', qid: 'Q311241', round: 12 },
	{ playerName: 'Kent', qid: 'Q455880', round: 13 },
	{ playerName: 'Kent', qid: 'Q1355840', round: 14 },
	{ playerName: 'Kent', qid: 'Q211082', round: 15 },
	{ playerName: 'Kent', qid: 'Q131299386', round: 16 },
	{ playerName: 'Kent', qid: 'Q389438', round: 17 },
	{ playerName: 'Kent', qid: 'Q36490532', round: 18 },
	{ playerName: 'Kent', qid: 'Q14542', round: 19 },
	{ playerName: 'Kent', qid: 'Q28784685', round: 20 },
	{ playerName: 'Kent', qid: 'Q188280', round: 21 },
	{ playerName: 'Kent', qid: 'Q2899818', round: 22 },
	{ playerName: 'Kent', qid: 'Q22005867', round: 23 },
	{ playerName: 'Kent', qid: 'Q42229', round: 24 },
	{ playerName: 'Kent', qid: 'Q720558', round: 25 },
	{ playerName: 'Randy', qid: 'Q228928', round: 1 },
	{ playerName: 'Randy', qid: 'Q7172170', round: 2 },
	{ playerName: 'Randy', qid: 'Q193635', round: 3 },
	{ playerName: 'Randy', qid: 'Q43203', round: 4 },
	{ playerName: 'Randy', qid: 'Q310493', round: 5 },
	{ playerName: 'Randy', qid: 'Q7509001', round: 6 },
	{ playerName: 'Randy', qid: 'Q142546', round: 7 },
	{ playerName: 'Randy', qid: 'Q37979', round: 8 },
	{ playerName: 'Randy', qid: 'Q358421', round: 9 },
	{ playerName: 'Randy', qid: 'Q310586', round: 10 },
	{ playerName: 'Randy', qid: 'Q449612', round: 11 },
	{ playerName: 'Randy', qid: 'Q505274', round: 12 },
	{ playerName: 'Randy', qid: 'Q158258', round: 13 },
	{ playerName: 'Randy', qid: 'Q104506', round: 14 },
	{ playerName: 'Randy', qid: 'Q16090535', round: 15 },
	{ playerName: 'Randy', qid: 'Q319121', round: 16 },
	{ playerName: 'Randy', qid: 'Q103939', round: 17 },
	{ playerName: 'Randy', qid: 'Q128121', round: 18 },
	{ playerName: 'Randy', qid: 'Q454088', round: 19 },
	{ playerName: 'Randy', qid: 'Q205599', round: 20 },
	{ playerName: 'Randy', qid: 'Q49075', round: 21 },
	{ playerName: 'Randy', qid: 'Q3528190', round: 22 },
	{ playerName: 'Randy', qid: 'Q57336', round: 23 },
	{ playerName: 'Randy', qid: 'Q537747', round: 24 },
	{ playerName: 'Randy', qid: 'Q42869', round: 25 },
	{ playerName: 'Sally', qid: 'Q457923', round: 1 },
	{ playerName: 'Sally', qid: 'Q367094', round: 2 },
	{ playerName: 'Sally', qid: 'Q137388078', round: 3 },
	{ playerName: 'Sally', qid: 'Q312514', round: 4 },
	{ playerName: 'Sally', qid: 'Q1971146', round: 5 },
	{ playerName: 'Sally', qid: 'Q216936', round: 6 },
	{ playerName: 'Sally', qid: 'Q312081', round: 7 },
	{ playerName: 'Sally', qid: 'Q153330', round: 8 },
	{ playerName: 'Sally', qid: 'Q52392', round: 9 },
	{ playerName: 'Sally', qid: 'Q1173157', round: 10 },
	{ playerName: 'Sally', qid: 'Q1806985', round: 11 },
	{ playerName: 'Sally', qid: 'Q46080', round: 12 },
	{ playerName: 'Sally', qid: 'Q139697', round: 13 },
	{ playerName: 'Sally', qid: 'Q212002', round: 14 },
	{ playerName: 'Sally', qid: 'Q51120751', round: 15 },
	{ playerName: 'Sally', qid: 'Q15935', round: 16 },
	{ playerName: 'Sally', qid: 'Q212648', round: 17 },
	{ playerName: 'Sally', qid: 'Q205721', round: 18 },
	{ playerName: 'Sally', qid: 'Q2808', round: 19 },
	{ playerName: 'Sally', qid: 'Q5556756', round: 20 },
	{ playerName: 'Sally', qid: 'Q81328', round: 21 },
	{ playerName: 'Sally', qid: 'Q114390240', round: 22 },
	{ playerName: 'Sally', qid: 'Q1352872', round: 23 },
	{ playerName: 'Sally', qid: 'Q297173', round: 24 },
	{ playerName: 'Sally', qid: 'Q24174947', round: 25 }
];

exports.handler = async (event, context) => {
  try {
    console.log('🔍 Starting enhanced death check with tracking...');
    
    // Step 1: Get previously notified deaths
    const notifiedDeaths = await getNotifiedDeaths();
    console.log(`📋 Found ${notifiedDeaths.length} previously notified deaths`);
    
    // Step 2: Check for all current deaths
    const allDeaths = [];
    const batchSize = 20;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const qids = batch.map(p => p.qid).join('|');
      const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids}&format=json&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      for (const player of batch) {
        const entity = data.entities[player.qid];
        if (entity?.claims?.P570) {
          const name = entity.labels?.en?.value || 'Unknown';
          const rawDate = entity.claims.P570[0].mainsnak.datavalue.value.time;
          const dateOfDeath = formatDate(rawDate);
          
          const deathKey = player.qid;
          
          allDeaths.push({
            name,
            playerName: player.playerName,
            dateOfDeath,
            qid: player.qid,
            deathKey
          });
        }
      }
    }
    
    console.log(`💀 Found ${allDeaths.length} total deaths`);
    
    // Step 3: Filter out deaths we've already notified about
    const newDeaths = allDeaths.filter(death => !notifiedDeaths.includes(death.deathKey));
    console.log(`🆕 Found ${newDeaths.length} NEW deaths to notify about`);
    
    // Step 4: Send notifications for new deaths only
    let notificationsSent = 0;
    for (const death of newDeaths) {
      await sendNotification(death);
      notificationsSent++;
    }
    
    // Step 5: Update the notified deaths list
    if (newDeaths.length > 0) {
      const updatedNotifiedDeaths = [...notifiedDeaths, ...newDeaths.map(d => d.deathKey)];
      await saveNotifiedDeaths(updatedNotifiedDeaths);
      console.log(`📝 Updated notified deaths list. Now tracking ${updatedNotifiedDeaths.length} deaths`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Death check completed`,
        totalDeathsFound: allDeaths.length,
        newDeaths: newDeaths.length,
        notificationsSent: notificationsSent,
        previouslyNotified: notifiedDeaths.length,
        newDeathNames: newDeaths.map(d => d.name)
      })
    };
    
  } catch (error) {
    console.error('❌ Error in enhanced death check:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Get list of deaths we've already notified about
async function getNotifiedDeaths() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  try {
    const gistsResponse = await fetch('https://api.github.com/gists', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!gistsResponse.ok) return [];

    const gists = await gistsResponse.json();
    const deathsGist = gists.find(gist => 
      gist.files && gist.files['dead-pool-notified-deaths.json'] &&
      gist.description === 'Dead Pool Notified Deaths Tracking'
    );

    if (!deathsGist) {
      console.log('📋 No existing deaths tracking gist found');
      return [];
    }

    const gistResponse = await fetch(deathsGist.url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!gistResponse.ok) return [];

    const gistData = await gistResponse.json();
    const fileContent = gistData.files['dead-pool-notified-deaths.json'].content;
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.log('📋 Error loading notified deaths:', error.message);
    return [];
  }
}

// Save updated list of notified deaths
async function saveNotifiedDeaths(notifiedDeaths) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GitHub token not configured');

  // Find existing gist or create new one
  const gistsResponse = await fetch('https://api.github.com/gists', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  let gistId = null;
  if (gistsResponse.ok) {
    const gists = await gistsResponse.json();
    const existingGist = gists.find(gist => 
      gist.files && gist.files['dead-pool-notified-deaths.json'] &&
      gist.description === 'Dead Pool Notified Deaths Tracking'
    );
    gistId = existingGist?.id;
  }

  const gistData = {
    description: 'Dead Pool Notified Deaths Tracking',
    public: false,
    files: {
      'dead-pool-notified-deaths.json': {
        content: JSON.stringify(notifiedDeaths, null, 2)
      },
      'README.md': {
        content: `# Dead Pool Deaths Tracking\n\nLast updated: ${new Date().toISOString()}\nTotal deaths notified: ${notifiedDeaths.length}\n\nThis gist tracks which deaths have already been notified to prevent duplicate notifications.`
      }
    }
  };

  const url = gistId 
    ? `https://api.github.com/gists/${gistId}`
    : 'https://api.github.com/gists';
  
  const method = gistId ? 'PATCH' : 'POST';

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
    throw new Error(`Failed to save notified deaths: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

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

async function sendNotification(death) {
  try {
    console.log(`📱 Sending notification for NEW death: ${death.name} (${death.playerName}'s pick)`);
    const baseUrl = process.env.URL || 'https://dirty-oar-dead-pool.netlify.app';
    
    const response = await fetch(`${baseUrl}/.netlify/functions/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '💀 Dead Pool Alert!',
        body: `${death.name} has died! ${death.playerName}'s pick. Check your standings.`,
        playerName: death.playerName,
        celebrityName: death.name,
        dateOfDeath: death.dateOfDeath
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    
    console.log(`✅ Notification sent for NEW death: ${death.name} (${death.playerName}'s pick)`);
    
  } catch (error) {
    console.error('❌ Failed to send notification for', death.name, ':', error);
  }
}
