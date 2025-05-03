// Extract game ID from URL
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('game');
document.getElementById('game-id-display').innerText = `Game ID: ${gameId}`;

// Example champion pool
let championPool = [];

fetch('champions.json')
    .then(res => res.json())
    .then(data => {
        championPool = data;
        renderChampionPool();
    });

function renderChampionPool() {
    const poolDiv = document.getElementById('champion-pool');
    poolDiv.innerHTML = '';
    championPool.forEach(champ => {
        const btn = document.createElement('button');
        btn.innerText = champ;
        btn.onclick = () => pickChampion(champ);
        poolDiv.appendChild(btn);
    });
}

function pickChampion(champion) {
    alert(`You picked ${champion}!`);
    // Add logic to track and update picks/bans here
}
