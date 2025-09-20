(function () {
  'use strict';

  // ==========================================================================
  // Constants & Global State
  // ==========================================================================
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  let startDate, endDate; // Will be set when settings loads
  const BATCH_SIZE = 40; // Adjust based on API limit
  const API_URL = 'https://www.wikidata.org/w/api.php';

  // State Variables
  const sortDirections = {};
  let mostUniquePlayer = 'none';

  // Initialize dates when settings is available
  function initializeDates() {
    if (typeof settings !== 'undefined') {
      startDate = new Date(settings.startDate);
      endDate = new Date(settings.endDate);
      return true;
    }
    return false;
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  // Check if the browser is online (arrow function for brevity)
  const checkConnection = () => window.navigator.onLine;

  // Format a raw date (from Wikidata) to "Month Day, Year"
  function formatDate(rawDate) {
    if (!rawDate) return '';

    // Wikidata often has dates like: +1942-03-01T00:00:00Z
    const dateRegex = /^\+(\d+)-(\d+)-(\d+)T/;
    const match = rawDate.match(dateRegex);
    if (!match) {
      return 'Invalid Date';
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // zero-based
    const day = parseInt(match[3], 10);
    // Create a UTC date
    const date = new Date(Date.UTC(year, month, day));

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  // Parse a formatted date ("January 2, 2025") to a true UTC Date
  function parseFormattedDate(dateStr) {
    if (!dateStr) return null;
    // Expected format: "January 2, 2025"
    const parts = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!parts) return null;
    const months = {
      January: 0, February: 1, March: 2, April: 3, May: 4,
      June: 5, July: 6, August: 7, September: 8,
      October: 9, November: 10, December: 11
    };
    const month = months[parts[1]];
    const day = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);
    if (month === undefined || isNaN(day) || isNaN(year)) {
      return null;
    }
    return new Date(Date.UTC(year, month, day));
  }

  // Calculate age using the parsed birthday
  function calculateAge(birthday) {
    if (!birthday) return 0;
    const birthDate = parseFormattedDate(birthday);
    if (!birthDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getUTCFullYear();
    const m = today.getMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getUTCDate())) {
      age--;
    }
    return age;
  }

  // Calculate Age at Death using the parsed dates
  function calculateAgeAtDeath(birthday, dateOfDeath) {
    if (!birthday || !dateOfDeath) return 0;
    const birthDate = parseFormattedDate(birthday);
    const deathDate = parseFormattedDate(dateOfDeath);
    if (!birthDate || !deathDate) return 0;
    let age = deathDate.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = deathDate.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && deathDate.getUTCDate() < birthDate.getUTCDate())) {
      age--;
    }
    return age;
  }

  // Calculate potential points (only for living celebrities)
  function calculatePotentialPoints(birthday, round, dateOfDeath) {
    if (dateOfDeath) return ''; // No potential points if dead
    const age = calculateAge(birthday);
    const roundPoints = 26 - round;
    return Math.max(100 - age, 0) + roundPoints;
  }

  // Calculate final points (only for dead celebrities)
  function calculateFinalPoints(birthday, dateOfDeath, round) {
    if (!dateOfDeath) return '';
    const deathDateUTC = parseFormattedDate(dateOfDeath);
    if (!deathDateUTC || deathDateUTC < startDate || deathDateUTC > endDate) return 'Disqualified';
    const ageAtDeath = calculateAgeAtDeath(birthday, dateOfDeath);
    const roundPoints = 26 - round;
    return Math.max(100 - ageAtDeath, 0) + roundPoints;
  }

  // Create a Wikipedia link for a name; adds a skull if dead
  function createNameLink(name, dateOfDeath) {
    const wikiTitle = encodeURIComponent(name.replace(/ /g, '_'));
    const linkText = dateOfDeath ? `${name} ☠️` : name;
    return `<a href="https://en.wikipedia.org/wiki/${wikiTitle}" target="_blank">${linkText}</a>`;
  }

  // ==========================================================================
  // Data Fetching Functions
  // ==========================================================================

  async function fetchData() {
    if (checkConnection()) {
      try {
        console.log('Fetching fresh data');
        const freshData = await fetchAllData();
        processAllData(freshData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
      }
    } else {
      console.log('No internet connection');
      alert('No internet connection detected. Please check your connection and try again.');
    }
  }

  // Fetch data in batches from the API
  async function fetchAllData() {
    let allData = [];
    for (let i = 0; i < players.length; i += BATCH_SIZE) {
      const batchPlayers = players.slice(i, i + BATCH_SIZE);
      const batchData = await fetchBatch(batchPlayers);
      allData = allData.concat(batchData);
      updateProgress(((i + BATCH_SIZE) / players.length) * 100);
    }
    return allData;
  }

  async function fetchBatch(batchPlayers) {
    const qids = batchPlayers.map(player => player.qid).join('|');
    const url = `${API_URL}?action=wbgetentities&ids=${qids}&format=json&origin=*`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      return batchPlayers.map(player => {
        const entity = data.entities[player.qid];
        if (!entity) {
          return {
            playerName: player.playerName,
            round: player.round,
            name: 'Data not found',
            birthday: '',
            dateOfDeath: ''
          };
        }
        const labels = getLabel(entity);
        const birthday = formatDate(entity.claims.P569 ? entity.claims.P569[0].mainsnak.datavalue.value.time : '');
        const dateOfDeath = formatDate(entity.claims.P570 ? entity.claims.P570[0].mainsnak.datavalue.value.time : '');
        return {
          playerName: player.playerName,
          round: player.round,
          name: labels,
          birthday: birthday,
          dateOfDeath: dateOfDeath
        };
      });
    } catch (error) {
      console.error('Error fetching batch data:', error);
      alert('An error occurred while fetching data. Please try again later.');
      return [];
    }
  }

  // ==========================================================================
  // Data Processing & Table Functions
  // ==========================================================================

  // Process all data: sort, create summary table rows, add table rows, update summaries, and sort graveyard
  function processAllData(allData) {
    allData.sort((a, b) => {
      if (a.playerName < b.playerName) return -1;
      if (a.playerName > b.playerName) return 1;
      return a.round - b.round;
    });

    createSummaryTableRows();
    allData.forEach(data => addTableRow(data));
    updateSummaryTable();
    sortGraveyardTable();
  }

  // Create summary table rows based on unique player names
  function createSummaryTableRows() {
    const summaryTableBody = document.querySelector('#summaryTable tbody');
    summaryTableBody.innerHTML = ''; // Clear existing rows
    const uniquePlayers = [...new Set(players.map(player => player.playerName))];
    uniquePlayers.forEach(playerName => {
      const row = summaryTableBody.insertRow();
      row.insertCell().innerText = playerName;
      // Create six additional cells for bonus/points categories
      for (let i = 0; i < 6; i++) {
        row.insertCell().innerText = '';
      }
    });
  }

  // Add a row to the person table (and graveyard if applicable)
  function addTableRow({ playerName, round, name, birthday, dateOfDeath }) {
    const tableRow = document.createElement('tr');
    tableRow.classList.add(playerName);

    // Calculate potential points (only if still alive)
    const potentialPoints = dateOfDeath ? '' : calculatePotentialPoints(birthday, round, dateOfDeath);
    const agePointsPotential = dateOfDeath ? '' : Math.max(100 - calculateAge(birthday), 0);
    const roundPointsPotential = dateOfDeath ? '' : 26 - round;
    const potentialTooltip = dateOfDeath ? '' : `(${roundPointsPotential} + ${agePointsPotential})`;

    // Calculate final points (only if dead)
    const finalPoints = calculateFinalPoints(birthday, dateOfDeath, round);
    const agePointsFinal = dateOfDeath ? Math.max(100 - calculateAgeAtDeath(birthday, dateOfDeath), 0) : '';
    const roundPointsFinal = dateOfDeath ? 26 - round : '';
    const finalTooltip = dateOfDeath ? `(${roundPointsFinal} + ${agePointsFinal})` : '';

    tableRow.innerHTML = `
      <td data-label="Player Name">${playerName}</td>
      <td class="round" data-label="Round">${round}</td>
      <td data-label="Celebrity Name">${createNameLink(name, dateOfDeath)}</td>
      <td data-label="Birthday">${birthday}</td>
      <td data-label="Date of Death">${dateOfDeath}</td>
      <td class="potential-points" data-label="Potential Points" title="${potentialTooltip}">${potentialPoints}</td>
      <td class="final-points" data-label="Final Points" title="${finalTooltip}">${finalPoints}</td>
    `;

    document.querySelector('#personTable tbody').appendChild(tableRow);

    // If the celebrity is dead, clone the row into the graveyard table (after removing the potential points cell)
    if (dateOfDeath) {
      const graveyardRow = tableRow.cloneNode(true);
      graveyardRow.deleteCell(5); // Remove Potential Points cell
      document.querySelector('#graveyardTable tbody').appendChild(graveyardRow);
    }
  }
  
  function getLabel(entity) {
    if (entity.labels) {
        if (entity.labels.en) {
            return entity.labels.en.value;
        } else if (entity.labels.mul) { // "mul" = multiple languages
            return entity.labels.mul.value;
        } else {
            // If no "en" or "mul", return the first available language:
            const firstAvailableLang = Object.keys(entity.labels)[0];
            return entity.labels[firstAvailableLanguage].value;
        }
    }
    return 'Label not available';
}


  // -------------------------------
  // Table Sorting Functions
  // -------------------------------

  // Add click event listeners to table headers for sorting
  function initEventListeners() {
    const headers = document.querySelectorAll('#personTable th');
    headers.forEach(header => {
      // Store the original header text if not already stored
      if (!header.dataset.originalText) {
        header.dataset.originalText = header.textContent;
      }
      header.addEventListener('click', () => {
        const column = header.getAttribute('data-column');
        sortTable(column);
        updateSortIndicators(column, sortDirections[column]);
      });
    });
  }

  // Sort the person table based on a given column
  function sortTable(column) {
    const table = document.getElementById('personTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const dir = sortDirections[column] || 'asc';
    sortDirections[column] = dir === 'asc' ? 'desc' : 'asc';

    rows.sort((a, b) => {
      const colIndex = getColumnIndex(column);
      const cellA = a.querySelector(`td:nth-child(${colIndex})`);
      const cellB = b.querySelector(`td:nth-child(${colIndex})`);
      let x = cellA ? cellA.innerText : '';
      let y = cellB ? cellB.innerText : '';

      if (['round', 'potentialPoints', 'finalPoints'].includes(column)) {
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;
      } else if (['birthday', 'dateOfDeath'].includes(column)) {
        x = parseFormattedDate(x) || new Date(0);
        y = parseFormattedDate(y) || new Date(0);
      } else {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      if (dir === 'asc') {
        return x > y ? 1 : x < y ? -1 : 0;
      } else {
        return x < y ? 1 : x > y ? -1 : 0;
      }
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  // Helper: Update sort indicators on the table headers
  function updateSortIndicators(activeColumn, direction) {
    const headers = document.querySelectorAll('#personTable th');
    headers.forEach(header => {
      // Reset header text to its original value
      header.innerHTML = header.dataset.originalText;
      if (header.getAttribute('data-column') === activeColumn) {
        // Append the arrow indicator based on sort direction
        header.innerHTML += ` ${direction === 'asc' ? '▲' : '▼'}`;
      }
    });
  }

  // Helper: Get the column index (1-based) for a given column name from the table header
  function getColumnIndex(column) {
    const headers = document.querySelectorAll('#personTable th');
    let index = 1;
    headers.forEach((header, i) => {
      if (header.getAttribute('data-column') === column) {
        index = i + 1;
      }
    });
    return index;
  }


  // ==========================================================================
  // Summary Table Functions
  // ==========================================================================

  function updateSummaryTable() {
    updateFirstDeathInTopTable();
    updateLastDeathInTopTable();
    updateHighestBodyCountInTopTable();
    updateAgePointsInTopTable();
    updateMostUniqueInTopTable();
    updateTotalPointsInTopTable();
  }

  function updateSummaryCell(cellIndex, playerNames, points) {
    const summaryRows = document.querySelectorAll('#summaryTable tbody tr');
    summaryRows.forEach(row => {
      row.cells[cellIndex].innerText = '';
    });
    const validPlayerNames = Array.isArray(playerNames) ? playerNames : [playerNames];
    summaryRows.forEach(row => {
      const playerNameCell = row.cells[0].innerText;
      if (validPlayerNames.includes(playerNameCell) && playerNameCell !== '') {
        row.cells[cellIndex].innerText = points;
      }
    });
  }

  function updateFirstDeathInTopTable() {
    const firstDeathPlayer = calculateFirstDeath();
    updateSummaryCell(1, firstDeathPlayer, 25);
  }

  function updateLastDeathInTopTable() {
    const lastDeathPlayer = calculateLastDeath();
    updateSummaryCell(2, lastDeathPlayer, 25);
  }

  function updateHighestBodyCountInTopTable() {
    const highestBodyCountPlayers = calculateHighestBodyCount();
    updateSummaryCell(3, highestBodyCountPlayers, 25);
  }

  function updateMostUniqueInTopTable() {
    const summaryRows = document.querySelectorAll('#summaryTable tbody tr');
    summaryRows.forEach(row => {
      const playerNameCell = row.cells[0]; // Player Name column
      row.cells[4].innerText = (playerNameCell.innerText === mostUniquePlayer) ? 25 : '';
    });
  }

  function updateAgePointsInTopTable() {
    const agePoints = calculateAgePoints();
    const summaryRows = document.querySelectorAll('#summaryTable tbody tr');
    summaryRows.forEach(row => {
      const playerName = row.cells[0].innerText;
      row.cells[5].innerText = agePoints[playerName] || 0;
    });
  }

  function updateTotalPointsInTopTable() {
    const summaryRows = Array.from(document.querySelectorAll('#summaryTable tbody tr'));
    let maxPoints = 0;
    let winningRow = null;

    summaryRows.forEach(row => {
      let totalPoints = 0;
      for (let i = 1; i <= 5; i++) {
        totalPoints += parseInt(row.cells[i].innerText) || 0;
      }
      row.cells[6].innerText = totalPoints;
      if (totalPoints > maxPoints) {
        maxPoints = totalPoints;
        winningRow = row;
      }
    });

    // Sort summary rows by total points descending
    summaryRows.sort((a, b) => {
      const pointsA = parseInt(a.cells[6].innerText) || 0;
      const pointsB = parseInt(b.cells[6].innerText) || 0;
      return pointsB - pointsA;
    });

    const tbody = document.querySelector('#summaryTable tbody');
    tbody.innerHTML = '';
    summaryRows.forEach(row => tbody.appendChild(row));

    // Highlight the winning row
    if (winningRow) {
      winningRow.style.fontWeight = 'bold';
      winningRow.style.border = '3px solid #ff686b';
      winningRow.style.color = '#ff686b';
    }
  }

  // Determine the player with the first (earliest) death within range
  function calculateFirstDeath() {
    let earliestDeath = new Date(Date.UTC(2026, 0, 6)); // endDate + 1 day
    let playerName = '';
    const rows = document.querySelectorAll('#personTable tbody tr');

    rows.forEach(row => {
      const deathDateStr = row.cells[4].innerText;
      if (deathDateStr) {
        const deathDateUTC = parseFormattedDate(deathDateStr);
        if (deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate) {
          if (deathDateUTC < earliestDeath) {
            earliestDeath = deathDateUTC;
            playerName = row.cells[0].innerText;
          }
        }
      }
    });
    return [playerName];
  }

  // Determine the player with the last (latest) death within range
  function calculateLastDeath() {
    let latestDeath = new Date(Date.UTC(2025, 0, 4)); // startDate - 1 day
    let playerName = '';
    const rows = document.querySelectorAll('#personTable tbody tr');

    rows.forEach(row => {
      const deathDateStr = row.cells[4].innerText;
      if (deathDateStr) {
        const deathDateUTC = parseFormattedDate(deathDateStr);
        if (deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate) {
          if (deathDateUTC > latestDeath) {
            latestDeath = deathDateUTC;
            playerName = row.cells[0].innerText;
          }
        }
      }
    });
    return [playerName];
  }

  // Calculate Highest Body Count bonus by counting qualifying final points per player
  function calculateHighestBodyCount() {
    const bodyCount = {};
    const rows = document.querySelectorAll('#personTable tbody tr');
    rows.forEach(row => {
      const playerName = row.cells[0].innerText;
      const finalPoints = row.cells[6].innerText;
      if (!isNaN(finalPoints) && finalPoints !== '' && finalPoints !== 'Disqualified') {
        bodyCount[playerName] = (bodyCount[playerName] || 0) + 1;
      }
    });
    const maxCount = Math.max(...Object.values(bodyCount));
    return Object.keys(bodyCount).filter(player => bodyCount[player] === maxCount);
  }

  // Calculate Age Points bonus by summing each player’s final points
  function calculateAgePoints() {
    const agePoints = {};
    const rows = document.querySelectorAll('#personTable tbody tr');
    rows.forEach(row => {
      const playerName = row.cells[0].innerText;
      const finalPoints = row.cells[6].innerText;
      if (!isNaN(finalPoints) && finalPoints !== '' && finalPoints !== 'Disqualified') {
        agePoints[playerName] = (agePoints[playerName] || 0) + parseInt(finalPoints);
      }
    });
    return agePoints;
  }
  
  // Sort the graveyard table by Date of Death
  function sortGraveyardTable() {
    const table = document.getElementById('graveyardTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    rows.sort((a, b) => {
      const dateStrA = a.cells[4].innerText;
      const dateStrB = b.cells[4].innerText;
      const dateA = parseFormattedDate(dateStrA);
      const dateB = parseFormattedDate(dateStrB);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
  }

  // ==========================================================================
  // Loading Overlay and Progress Functions
  // ==========================================================================

  const showLoadingOverlay = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
  };

  const hideLoadingOverlay = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${percentage}%`;
  }
  
  function applyPlayerColors() {
    if (typeof settings === 'undefined' || !settings.playerColors) return; // Safety check

    let styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);

    Object.entries(settings.playerColors).forEach(([player, color]) => {
        styleSheet.sheet.insertRule(`.${player.replace(/\s+/g, "_")} { background-color: ${color} !important; }`, 0);
    });
}

// Don't call applyPlayerColors immediately - wait for settings to load


  // ==========================================================================
  // Push Notification Functionality
  // ==========================================================================

  // Check if browser supports notifications
  function isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Initialize notification functionality
  function initNotifications() {
    const subscribeBtn = document.getElementById('notifyButton');
    const statusDiv = document.getElementById('notifyStatus');

    if (!subscribeBtn) return;

    // Check browser support
    if (!isNotificationSupported()) {
      statusDiv.textContent = 'Push notifications not supported in this browser';
      statusDiv.className = 'notify-status error';
      subscribeBtn.disabled = true;
      return;
    }

    // Check current notification permission
    updateNotificationUI();

    // Add click handler
    subscribeBtn.addEventListener('click', handleSubscriptionClick);
  }

  // Update UI based on current notification state
  function updateNotificationUI() {
    const subscribeBtn = document.getElementById('notifyButton');
    const statusDiv = document.getElementById('notifyStatus');
    const btnText = subscribeBtn.querySelector('.btn-text');
    const btnIcon = subscribeBtn.querySelector('.btn-icon');

    switch (Notification.permission) {
      case 'granted':
        btnText.textContent = 'Notifications Enabled';
        btnIcon.textContent = '✅';
        subscribeBtn.disabled = true;
        statusDiv.textContent = 'You\'ll be notified when someone dies!';
        statusDiv.className = 'notify-status success';
        break;
      case 'denied':
        btnText.textContent = 'Notifications Blocked';
        btnIcon.textContent = '❌';
        subscribeBtn.disabled = true;
        statusDiv.textContent = 'Please enable notifications in your browser settings';
        statusDiv.className = 'notify-status error';
        break;
      default:
        btnText.textContent = 'Get Notified When Someone Dies';
        btnIcon.textContent = '🔔';
        subscribeBtn.disabled = false;
        statusDiv.textContent = 'Click to enable death notifications';
        statusDiv.className = 'notify-status info';
    }
  }

  // Handle subscription button click
  async function handleSubscriptionClick() {
    const subscribeBtn = document.getElementById('notifyButton');
    const statusDiv = document.getElementById('notifyStatus');

    try {
      subscribeBtn.disabled = true;
      statusDiv.textContent = 'Requesting permission...';
      statusDiv.className = 'notify-status info';

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI80j4JKt25_6DBLRUW6nNHHmxVxjL3pEcaykDbMDpSS6NxRGhtJ-4TLuU')
        });

        // Send subscription to server
        await sendSubscriptionToServer(subscription);

        updateNotificationUI();
      } else {
        updateNotificationUI();
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      statusDiv.textContent = 'Failed to enable notifications. Please try again.';
      statusDiv.className = 'notify-status error';
      subscribeBtn.disabled = false;
    }
  }

  // Convert VAPID key to Uint8Array
  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send subscription to server
  async function sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      console.log('Subscription saved successfully');
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }


  // ==========================================================================
  // Initialize Application
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    // Wait for settings to be available
    if (!initializeDates()) {
      console.error('Settings not loaded yet');
      return;
    }
    
    showLoadingOverlay();
    initEventListeners();
    initNotifications(); // Initialize notification functionality
    applyPlayerColors(); // Apply player colors after settings loaded
    fetchData().finally(() => {
      hideLoadingOverlay();
    });
  });
})();
