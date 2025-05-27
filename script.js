const API_KEY = '734cacb3c0ebb8a52d5d52615e5e89cf';

const teams = [
    { id: 541, name: 'Real Madrid', flag: '🇪🇸' },
    { id: 529, name: 'FC Barcelona', flag: '🇪🇸' },
    { id: 530, name: 'Atletico Madrid', flag: '🇪🇸' },
    { id: 33, name: 'Manchester United', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 50, name: 'Manchester City', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 40, name: 'Liverpool', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 42, name: 'Arsenal', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 49, name: 'Chelsea', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 47, name: 'Tottenham Hotspur', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 157, name: 'Bayern Munich', flag: '🇩🇪' },
    { id: 165, name: 'Borussia Dortmund', flag: '🇩🇪' },
    { id: 173, name: 'RB Leipzig', flag: '🇩🇪' },
    { id: 496, name: 'Juventus', flag: '🇮🇹' },
    { id: 489, name: 'AC Milan', flag: '🇮🇹' },
    { id: 505, name: 'Inter Milan', flag: '🇮🇹' },
    { id: 492, name: 'Napoli', flag: '🇮🇹' },
    { id: 85, name: 'Paris Saint-Germain', flag: '🇫🇷' },
    { id: 81, name: 'Olympique Marseille', flag: '🇫🇷' },
    { id: 194, name: 'Ajax Amsterdam', flag: '🇳🇱' },
    { id: 236, name: 'Benfica', flag: '🇵🇹' },
];

const currentYear = new Date().getFullYear();
const years = [];
for(let y = currentYear; y >= 2024; y--) {
    years.push(y);
}

const elements = {
    teamFilter: document.getElementById('teamFilter'),
    yearFilter: document.getElementById('yearFilter'),
    typeFilter: document.getElementById('typeFilter'),
    clearFilter: document.getElementById('clearFilter'),
    transferList: document.getElementById('transfer-list'),
    loading: document.getElementById('loading'),
    noResults: document.getElementById('no-results'),
    totalTransfers: document.getElementById('totalTransfers')
};

let allTransfers = [];

function initDropdowns() {
    // Teams
    teams.forEach(team => {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = `${team.flag} ${team.name}`;
    elements.teamFilter.appendChild(option);
    });

    // Years
    years.forEach(y => {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    elements.yearFilter.appendChild(option);
    });

    elements.teamFilter.value = 541;
    elements.yearFilter.value = currentYear;
    elements.typeFilter.value = 'all';
}

async function fetchTransfers(teamId) {
    elements.loading.style.display = 'block';
    elements.transferList.innerHTML = '';
    elements.noResults.classList.add('hidden');

    try {
    const response = await fetch(`https://v3.football.api-sports.io/transfers?team=${teamId}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY }
    });
    const data = await response.json();

    allTransfers = [];
    if(data.response) {
        data.response.forEach(player => {
        player.transfers.forEach(transfer => {
            allTransfers.push({
            playerName: player.player.name,
            playerPhoto: player.player.photo,
            fromTeam: transfer.teams.out.name,
            fromTeamLogo: transfer.teams.out.logo,
            toTeam: transfer.teams.in.name,
            toTeamLogo: transfer.teams.in.logo,
            date: transfer.date,
            type: transfer.type,
            year: new Date(transfer.date).getFullYear()
            });
        });
        });
    }

    allTransfers.sort((a,b) => new Date(b.date) - new Date(a.date));
    elements.loading.style.display = 'none';
    filterAndDisplay();

    } catch (error) {
    elements.loading.style.display = 'none';
    elements.transferList.innerHTML = `
        <div class="github-card rounded-lg p-6 text-center">
        <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-3"></i>
        <p class="text-red-400 font-medium">Failed to load transfers</p>
        <p class="text-muted text-sm mt-1">API token has expired for today try tomorrow</p>
        </div>
    `;
    console.error(error);
    }
}

function filterAndDisplay() {
    const year = elements.yearFilter.value;
    const type = elements.typeFilter.value;

    let filtered = allTransfers;

    if(year !== 'all') {
    filtered = filtered.filter(t => t.year.toString() === year);
    }

    if(type !== 'all') {
    if(type === '€') {
        filtered = filtered.filter(t => t.type !== 'Free' && t.type !== 'Loan');
    } else {
        filtered = filtered.filter(t => t.type === type);
    }
    }

    displayTransfers(filtered);
}

function displayTransfers(transfers) {
    elements.transferList.innerHTML = '';
    elements.totalTransfers.textContent = transfers.length;

    if(transfers.length === 0) {
    elements.noResults.classList.remove('hidden');
    return;
    }

    elements.noResults.classList.add('hidden');

    transfers.forEach(transfer => {
    const card = document.createElement('div');
    card.className = 'github-card rounded-lg p-4 fade-in';

    const typeConfig = {
        'Free': { text: 'Free', color: 'text-green-400' },
        'Loan': { text: 'Loan', color: 'text-yellow-400' },
        default: { text: 'Paid', color: 'text-accent' }
    };

    const config = typeConfig[transfer.type] || typeConfig.default;
    const formattedDate = new Date(transfer.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="flex items-start space-x-4">
        <div class="flex-1">
            <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-lg">${transfer.playerName}</h3>
            <span class="text-sm ${config.color} font-medium">${config.text}</span>
            </div>
            
            <div class="space-y-2 mb-3">
            <div class="flex items-center space-x-3 text-sm">
                <span class="text-muted">From:</span>
                <img src="${transfer.fromTeamLogo || '/api/placeholder/16/16'}" alt="" class="w-4 h-4" />
                <span>${transfer.fromTeam}</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
                <span class="text-muted">To:</span>
                <img src="${transfer.toTeamLogo || '/api/placeholder/16/16'}" alt="" class="w-4 h-4" />
                <span>${transfer.toTeam}</span>
            </div>
            </div>
            
            <div class="flex items-center justify-between text-sm text-muted">
            <span>${formattedDate}</span>
            <span>${transfer.year}</span>
            </div>
        </div>
        </div>
    `;

    elements.transferList.appendChild(card);
    });
}

function clearFilters() {
    elements.teamFilter.value = 541;
    elements.yearFilter.value = currentYear;
    elements.typeFilter.value = 'all';
    fetchTransfers(541);
}

// Event listeners
elements.teamFilter.addEventListener('change', () => fetchTransfers(elements.teamFilter.value));
elements.yearFilter.addEventListener('change', filterAndDisplay);
elements.typeFilter.addEventListener('change', filterAndDisplay);
elements.clearFilter.addEventListener('click', clearFilters);

// Initialize
initDropdowns();
fetchTransfers(541);