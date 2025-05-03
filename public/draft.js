// Global champion lists
let championPool = [];
let filteredPool = [];

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1) Extract game ID from URL
    const urlParams     = new URLSearchParams(window.location.search);
    const gameId        = urlParams.get('game');
    const gameIdDisplay = document.getElementById('game-id-display');

    if (gameId && gameIdDisplay) {
        gameIdDisplay.innerText = `Game ID: ${gameId}`;
    }

    // 2) Copy-to-clipboard button
    const copyBtn = document.getElementById('copy-id-btn');
    if (copyBtn) {
        if (gameId) {
            copyBtn.addEventListener('click', () => {
                console.log('Copy button clicked, copying:', gameId);
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(gameId)
                        .then(() => {
                            copyBtn.innerText = 'Copied!';
                            setTimeout(() => { copyBtn.innerText = '📋 Copy ID'; }, 1500);
                        })
                        .catch(err => {
                            console.error('Clipboard API failed', err);
                            fallbackCopyText(gameId, copyBtn);
                        });
                } else {
                    fallbackCopyText(gameId, copyBtn);
                }
            });
        } else {
            console.error('No game ID to copy.');
            copyBtn.disabled = true;
        }
    } else {
        console.error('Copy ID button not found.');
    }

    // 3) Load champions from JSON
    fetch('champions.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            console.log("Champions loaded:", data);
            championPool  = data;
            filteredPool  = [...championPool];
            renderChampionPool(filteredPool);
        })
        .catch(err => {
            console.error("Failed to load champion data:", err);
        });

    // 4) Hook up search bar
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

// -- Fallback copy function using a hidden textarea --
function fallbackCopyText(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Move off-screen
    textarea.style.position = 'fixed';
    textarea.style.top      = '0';
    textarea.style.left     = '0';
    textarea.style.opacity  = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        console.log('Fallback copy was ' + (successful ? 'successful' : 'unsuccessful'));
        if (button) {
            if (successful) {
                button.innerText = 'Copied!';
                setTimeout(() => { button.innerText = '📋 Copy ID'; }, 1500);
            } else {
                alert('Copy failed — please copy manually.');
            }
        }
    } catch (err) {
        console.error('Fallback: unable to copy', err);
        alert('Copy failed — please copy manually.');
    }

    document.body.removeChild(textarea);
}

// -- Render champion buttons --
function renderChampionPool(list) {
    const poolDiv = document.getElementById('champion-pool');
    if (!poolDiv) {
        console.error("champion-pool element not found!");
        return;
    }
    poolDiv.innerHTML = '';
    list.forEach(champ => {
        const btn = document.createElement('button');
        btn.title                 = champ;
        btn.style.backgroundImage = `url('assets/${champ}.jpg')`;
        btn.style.backgroundSize  = 'cover';
        btn.style.backgroundPosition = 'center';
        btn.onclick               = () => pickChampion(champ);
        poolDiv.appendChild(btn);
    });
}

// -- Handle champion pick --
function pickChampion(champion) {
    alert(`You picked ${champion}`);
    // TODO: integrate with your pick/ban state machine
}
