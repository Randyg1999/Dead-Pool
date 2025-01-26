            (function() {
            'use strict';

			// Cache TTL and Connection Check Functions
			const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

			function getCachedData() {
				const cachedData = JSON.parse(localStorage.getItem('wikidataCache'));
				const cachedTime = localStorage.getItem('cacheTime');
				if (cachedData && cachedTime && (Date.now() - cachedTime) < CACHE_TTL) {
					return cachedData;
				}
				return null;
			}

			function setCachedData(data) {
				localStorage.setItem('wikidataCache', JSON.stringify(data));
				localStorage.setItem('cacheTime', Date.now());
			}

			function checkConnection() {
				return window.navigator.onLine;
			}
			
			function displayCachedData() {
				const cachedData = getCachedData();
				if (cachedData) {
					const lastUpdateTime = new Date(parseInt(localStorage.getItem('cacheTime'), 10));
					processAllData(cachedData);
					alert(`Displaying last known data from ${lastUpdateTime.toLocaleString()}.`);
				} else {
					alert('No cached data available.');
				}
			}

			async function fetchData() {
				if (checkConnection()) {
					try {
						console.log('Fetching fresh data');
						const freshData = await fetchAllData(); // Your existing fetch function
						setCachedData(freshData); // Store fetched data in cache
						processAllData(freshData); // Process and display data
					} catch (error) {
						console.log('Error fetching data. Using cached data');
						displayCachedData(); // Fallback to cached data if API fails
					}
				} else {
					console.log('No internet connection. Using cached data');
					displayCachedData();
					alert('No internet connection detected. Showing last known data.');
				}
			}

            // Game Dates
const startDate = new Date(Date.UTC(2025, 0, 5));
const endDate = new Date(Date.UTC(2026, 0, 6));

            // Constants
            const BATCH_SIZE = 40; // Adjust based on API limit
            const API_URL = 'https://www.wikidata.org/w/api.php';

            // State Variables - After vote, insert player name for most unique death
            let sortDirections = {};
            let mostUniquePlayer = 'none';

            // Initialize Application
			document.addEventListener('DOMContentLoaded', () => {
				showLoadingOverlay();
				initEventListeners(); // Initialize click handlers for sorting, etc.

				fetchData()  // Fetch data or use cache
					.finally(() => {
						hideLoadingOverlay(); // Hide loading overlay after fetch or cache load
					});
			});

            // Event Listeners
            function initEventListeners() {
                const headers = document.querySelectorAll('#personTable th');
                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const column = header.getAttribute('data-column');
                        sortTable(column);
                    });
                });
            }

            // Fetch Data in Batches
            async function fetchAllData() {
                let allData = [];
                for (let i = 0; i < players.length; i += BATCH_SIZE) {
                    const batchPlayers = players.slice(i, i + BATCH_SIZE);
                    const batchData = await fetchBatch(batchPlayers);
                    allData = allData.concat(batchData);
                    updateProgress((i + BATCH_SIZE) / players.length * 100);
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
                        const labels = entity.labels.en ? entity.labels.en.value : 'Data not found';
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

            // Process All Data
			function processAllData(allData) {
				// Sort allData by playerName and then by round
				allData.sort((a, b) => {
					if (a.playerName < b.playerName) return -1;
					if (a.playerName > b.playerName) return 1;
					return a.round - b.round;
				});

				createSummaryTableRows();
				allData.forEach(data => {
					addTableRow(data);
				});

				updateSummaryTable();
				sortGraveyardTable();
			}



            // Create Summary Table Rows
            function createSummaryTableRows() {
                const summaryTableBody = document.querySelector('#summaryTable tbody');
                const uniquePlayers = [...new Set(players.map(player => player.playerName))];
                uniquePlayers.forEach(playerName => {
                    const row = summaryTableBody.insertRow();
                    row.insertCell().innerText = playerName;
                    for (let i = 0; i < 6; i++) {
                        row.insertCell().innerText = '';
                    }
                });
            }

            // Add Table Row
function addTableRow({ playerName, round, name, birthday, dateOfDeath }) {
    const tableRow = document.createElement('tr');
    tableRow.classList.add(playerName);

    // Calculate Potential Points and its breakdown
    const potentialPoints = dateOfDeath ? '' : calculatePotentialPoints(birthday, round, dateOfDeath);
    const agePointsPotential = dateOfDeath ? '' : Math.max(100 - calculateAge(birthday), 0);
    const roundPointsPotential = dateOfDeath ? '' : 26 - round;
    const potentialTooltip = dateOfDeath ? '' : `(${roundPointsPotential} + ${agePointsPotential})`;

    // Calculate Final Points and its breakdown
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

    // Add to Graveyard if applicable
    if (dateOfDeath) {
        const graveyardRow = tableRow.cloneNode(true);
        graveyardRow.deleteCell(5); // Remove Potential Points
        document.querySelector('#graveyardTable tbody').appendChild(graveyardRow);
    }
}

            // Create Name Link
            function createNameLink(name, dateOfDeath) {
                const wikiTitle = encodeURIComponent(name.replace(/ /g, '_'));
                const linkText = dateOfDeath ? `${name} ☠️` : name;
                return `<a href="https://en.wikipedia.org/wiki/${wikiTitle}" target="_blank">${linkText}</a>`;
            }

            // Update Summary Table
            function updateSummaryTable() {
                updateFirstDeathInTopTable();
                updateLastDeathInTopTable();
                updateHighestBodyCountInTopTable();
                updateAgePointsInTopTable();
		updateMostUniqueInTopTable();
                updateTotalPointsInTopTable();
            }

            // Format Date
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

  // Manually format the date string using UTC getters
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[date.getUTCMonth()];
  const utcDay = date.getUTCDate();
  const utcYear = date.getUTCFullYear();

  return `${monthName} ${utcDay}, ${utcYear}`;
}

            // Calculate Potential Points
function calculatePotentialPoints(birthday, round, dateOfDeath) {
    if (dateOfDeath) return ''; // If the celebrity is dead, no potential points
    const age = calculateAge(birthday);
    const roundPoints = 26 - round; // Calculate round points
    return Math.max(100 - age, 0) + roundPoints; // Add age points and round points
}

            // Calculate Final Points
function calculateFinalPoints(birthday, dateOfDeath, round) {
if (!dateOfDeath) return '';
const deathDate = new Date(dateOfDeath + 'T12:00:00Z');
const deathDateUTC = new Date(Date.UTC(deathDate.getFullYear(), deathDate.getMonth(), deathDate.getDate()));
if (deathDateUTC < startDate || deathDateUTC > endDate) return 'Disqualified';

    const ageAtDeath = calculateAgeAtDeath(birthday, dateOfDeath);
    const roundPoints = 26 - round; // Calculate round points
    return Math.max(100 - ageAtDeath, 0) + roundPoints; // Add age points and round points
}

            // Calculate Age
function calculateAge(birthday) {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

            // Calculate Age at Death
function calculateAgeAtDeath(birthday, dateOfDeath) {
    if (!birthday || !dateOfDeath) return 0;
    const birthDate = new Date(birthday);
    const deathDate = new Date(dateOfDeath);
    let age = deathDate.getFullYear() - birthDate.getFullYear();
    const m = deathDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

            // Sort Table
function sortTable(column) {
  const table = document.getElementById('personTable');
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);

  const dir = sortDirections[column] || 'asc';
  sortDirections[column] = dir === 'asc' ? 'desc' : 'asc';

  rows.sort((a, b) => {
    let x = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).innerText;
    let y = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).innerText;

    if (column === 'round' || column === 'potentialPoints' || column === 'finalPoints') {
      x = parseFloat(x) || 0;
      y = parseFloat(y) || 0;
    } else if (column === 'birthday' || column === 'dateOfDeath') {
      x = parseFormattedDate(x);
      y = parseFormattedDate(y);
    } else {
      x = x.toLowerCase();
      y = y.toLowerCase();
    }

    // Compare
    if (dir === 'asc') {
      return x > y ? 1 : -1;
    } else {
      return x < y ? 1 : -1;
    }
  });

  // Re‐append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}
			
			// Sort Graveyard Table by Date of Death
function sortGraveyardTable() {
    const table = document.getElementById('graveyardTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    // Sort rows based on death date
    rows.sort((a, b) => {
        const dateStrA = a.cells[4].innerText;
        const dateStrB = b.cells[4].innerText;
        
        const dateA = parseFormattedDate(dateStrA);
        const dateB = parseFormattedDate(dateStrB);
        
        // Handle cases where parsing might fail
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateA - dateB;
    });

    // Clear and re-append sorted rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    rows.forEach(row => tbody.appendChild(row));
}

            // Get Column Index
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

            // Update First Death in Summary Table
            function updateFirstDeathInTopTable() {
                const firstDeathPlayer = calculateFirstDeath();
                updateSummaryCell(1, firstDeathPlayer, 25);
            }

            // Update Last Death in Summary Table
            function updateLastDeathInTopTable() {
                const lastDeathPlayer = calculateLastDeath();
                updateSummaryCell(2, lastDeathPlayer, 25);
            }

            // Update Highest Body Count in Summary Table
			function updateHighestBodyCountInTopTable() {
				const highestBodyCountPlayers = calculateHighestBodyCount();
				updateSummaryCell(3, highestBodyCountPlayers, 25); // Pass array of players
			}

			//Update Most Unique Death in Summary table
			function updateMostUniqueInTopTable() {
				const summaryTableRows = document.querySelectorAll('#summaryTable tbody tr');

				summaryTableRows.forEach(row => {
					const playerNameCell = row.cells[0]; // Assuming Player Name is the first column
					if (playerNameCell.innerText === mostUniquePlayer) {
						row.cells[4].innerText = 25; // Assign 25 points to 'Most Unique' column
					} else {
						row.cells[4].innerText = ''; // Ensure other players do not have points in this column
					}
				});
			}

            // Update Age Points in Summary Table
            function updateAgePointsInTopTable() {
                const agePoints = calculateAgePoints();
                const summaryRows = document.querySelectorAll('#summaryTable tbody tr');
                summaryRows.forEach(row => {
                    const playerName = row.cells[0].innerText;
                    row.cells[5].innerText = agePoints[playerName] || 0;
                });
            }

			// Update Total Points in Summary Table
			function updateTotalPointsInTopTable() {
				const summaryRows = Array.from(document.querySelectorAll('#summaryTable tbody tr'));
				let maxPoints = 0;
				let winningRow = null;

				// Calculate Total Points for each player
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

				// Sort summaryRows based on Total Points in descending order
				summaryRows.sort((a, b) => {
					const pointsA = parseInt(a.cells[6].innerText) || 0; // Total Points column
					const pointsB = parseInt(b.cells[6].innerText) || 0;
					return pointsB - pointsA; // Sort in descending order
				});

				// Re-append the sorted rows to the tbody
				const tbody = document.querySelector('#summaryTable tbody');
				tbody.innerHTML = ''; // Clear existing rows
				summaryRows.forEach(row => {
					tbody.appendChild(row);
				});

				// Highlight Winner (if needed)
				if (winningRow) {
					winningRow.style.fontWeight = 'bold';
					winningRow.style.border = '3px solid #ff686b';
					winningRow.style.color = '#ff686b';
				}
			}


            // Update Summary Cell
function updateSummaryCell(cellIndex, playerNames, points) {
    const summaryRows = document.querySelectorAll('#summaryTable tbody tr');
    
    // Clear the entire column first
    summaryRows.forEach(row => {
        row.cells[cellIndex].innerText = '';
    });

    // Ensure playerNames is always an array and handle empty/null cases
    const validPlayerNames = Array.isArray(playerNames) ? playerNames : [playerNames];
    
    // Update cells for players who receive the bonus
    summaryRows.forEach(row => {
        const playerNameCell = row.cells[0].innerText;
        if (validPlayerNames.includes(playerNameCell) && playerNameCell !== '') {
            row.cells[cellIndex].innerText = points;
        }
    });
}

            // Calculate First Death
function calculateFirstDeath() {
    let earliestDeath = new Date(Date.UTC(2026, 0, 6)); // Set to endDate + 1 day
    let playerName = '';
    const rows = document.querySelectorAll('#personTable tbody tr');
    
    rows.forEach(row => {
        const deathDateStr = row.cells[4].innerText;
        if (deathDateStr) {
            const deathDateUTC = parseFormattedDate(deathDateStr);
            
            console.log('Processing death date:', {
                original: deathDateStr,
                parsed: deathDateUTC,
                isValid: deathDateUTC !== null,
                isInRange: deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate
            });
            
            if (deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate) {
                if (deathDateUTC < earliestDeath) {
                    earliestDeath = deathDateUTC;
                    playerName = row.cells[0].innerText;
                }
            }
        }
    });
    
    console.log('First death calculated:', {
        player: playerName,
        date: earliestDeath
    });
    
    return [playerName];
}

            // Calculate Last Death
function calculateLastDeath() {
    let latestDeath = new Date(Date.UTC(2025, 0, 4)); // Set to startDate - 1 day
    let playerName = '';
    const rows = document.querySelectorAll('#personTable tbody tr');
    
    rows.forEach(row => {
        const deathDateStr = row.cells[4].innerText;
        if (deathDateStr) {
            const deathDateUTC = parseFormattedDate(deathDateStr);
            
            console.log('Processing death date for last death:', {
                original: deathDateStr,
                parsed: deathDateUTC,
                isValid: deathDateUTC !== null,
                isInRange: deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate
            });
            
            if (deathDateUTC && deathDateUTC >= startDate && deathDateUTC <= endDate) {
                if (deathDateUTC > latestDeath) {
                    latestDeath = deathDateUTC;
                    playerName = row.cells[0].innerText;
                }
            }
        }
    });
    
    console.log('Last death calculated:', {
        player: playerName,
        date: latestDeath
    });
    
    return [playerName];
}

function parseFormattedDate(dateStr) {
  if (!dateStr) return null;

  // Expected format: "January 2, 2025"
  const parts = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
  if (!parts) return null;

  const months = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4,
    'June': 5, 'July': 6, 'August': 7, 'September': 8,
    'October': 9, 'November': 10, 'December': 11
  };

  const month = months[parts[1]];
  const day = parseInt(parts[2], 10);
  const year = parseInt(parts[3], 10);

  if (month === undefined || isNaN(day) || isNaN(year)) {
    return null;
  }

  // Create a true UTC date
  return new Date(Date.UTC(year, month, day));
}

            // Calculate Highest Body Count
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

            // Calculate Age Points
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

            // Loading Overlay Functions
            function showLoadingOverlay() {
                document.getElementById('loadingOverlay').style.display = 'flex';
            }

            function hideLoadingOverlay() {
                document.getElementById('loadingOverlay').style.display = 'none';
            }

            function updateProgress(percentage) {
                const progressFill = document.getElementById('progressFill');
                progressFill.style.width = `${percentage}%`;
            }

        })();
