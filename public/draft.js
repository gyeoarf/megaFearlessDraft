// Global champion lists
let championPool = [];
let filteredPool = [];

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Extract game ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    const gameIdDisplay = document.getElementById('game-id-display');

    if (gameId && gameIdDisplay) {
        gameIdDisplay.innerText = `Game ID: ${gameId}`;
    }

    // Load champions from JSON
    fetch('champions.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            console.log("Champions loaded:", data);
            championPool = data;
            filteredPool = [...championPool];   // initialize filtered list
            renderChampionPool(filteredPool);
        })
        .catch(err => {
            console.error("Failed to load champion data:", err);
        });

    // Hook up search bar
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            filteredPool = championPool.filter(champ =>
                champ.toLowerCase().includes(query)
            );
            renderChampionPool(filteredPool);
        });
    }
});

// Render champion buttons
function renderChampionPool(list) {
    const poolDiv = document.getElementById('champion-pool');
    poolDiv.innerHTML = '';
    list.forEach(champ => {
        const btn = document.createElement('button');
        btn.title = champ;
        // Use exact-case filename
        btn.style.backgroundImage = `url('assets/${champ}.jpg')`;
        btn.style.backgroundSize     = 'cover';
        btn.style.backgroundPosition = 'center';
        btn.onclick = () => pickChampion(champ);
        poolDiv.appendChild(btn);
    });
}


// Handle champion pick
function pickChampion(champion) {
    alert(`You picked ${champion}`);
    // TODO: integrate with your pick/ban state machine
}
