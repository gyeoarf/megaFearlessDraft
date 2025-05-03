// -------------------------
// Draft sequence & state
// -------------------------
const draftSequence = [
    { action: 'BAN',  team: 'B', slot: 'B1'    },
    { action: 'BAN',  team: 'R', slot: 'R1'    },
    { action: 'BAN',  team: 'B', slot: 'B2'    },
    { action: 'BAN',  team: 'R', slot: 'R2'    },
    { action: 'BAN',  team: 'B', slot: 'B3'    },
    { action: 'BAN',  team: 'R', slot: 'R3'    },
    { action: 'PICK', team: 'B', slot: 'B1'    },
    { action: 'PICK', team: 'R', slot: 'R1'    },
    { action: 'PICK', team: 'R', slot: 'R2'    },
    { action: 'PICK', team: 'B', slot: 'B2'    },
    { action: 'PICK', team: 'B', slot: 'B3'    },
    { action: 'PICK', team: 'R', slot: 'R3'    },
    { action: 'BAN',  team: 'B', slot: 'B1-2'  },
    { action: 'BAN',  team: 'R', slot: 'R1-2'  },
    { action: 'BAN',  team: 'B', slot: 'B2-2'  },
    { action: 'BAN',  team: 'R', slot: 'R2-2'  },
    { action: 'PICK', team: 'R', slot: 'R1-2'  },
    { action: 'PICK', team: 'B', slot: 'B1-2'  },
    { action: 'PICK', team: 'B', slot: 'B2-2'  },
    { action: 'PICK', team: 'R', slot: 'R2-2'  }
];
let championList   = [];
let filteredPool   = [];
let seriesRef      = null;
let unsubscribe    = null;

// -------------------------
// DOM Ready
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1) Grab Game ID & Series ref
    const params   = new URLSearchParams(window.location.search);
    const gameId   = params.get('game');
    if (!gameId) return alert('No game ID in URL!');

    // Display it & wire up Copy-ID
    document.getElementById('game-id-display').innerText = `Game ID: ${gameId}`;
    setupCopyButton(gameId);

    // 2) Point at your Firestore series doc
    seriesRef = db.collection('series').doc(gameId);

    // 3) Fetch champion list
    fetch('champions.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            championList = data;
            filteredPool = [...data];
            // Once we have our master list, start listening to Firestore
            startFirestoreListener();
        })
        .catch(err => console.error('Could not load champions.json', err));

    // 4) Hook up search
    const searchInput = document.getElementById('search');
    searchInput?.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        filteredPool = championList.filter(c => c.toLowerCase().includes(q));
        renderGrid();
    });
});

// -------------------------
// Real-time Firestore sync
// -------------------------
function startFirestoreListener() {
    // Unsubscribe old if any
    unsubscribe?.();

    unsubscribe = seriesRef.onSnapshot(doc => {
        if (!doc.exists) return alert('Series not found or was deleted');

        const data = doc.data();
        const used = data.usedChampions || [];
        const step = data.currentStep     || 0;

        // Rebuild available pool & grid
        filteredPool = championList.filter(c => !used.includes(c));
        renderGrid();

        // (Optional) You can also render picks/bans into slots here
        console.log(`🔄 Synced: step=${step}, usedChampions=${used.join(',')}`);
    }, err => {
        console.error('Firestore onSnapshot error:', err);
    });
}

// -------------------------
// Render champion grid
// -------------------------
function renderGrid() {
    const poolDiv = document.getElementById('champion-pool');
    poolDiv.innerHTML = '';
    filteredPool.forEach(champ => {
        const btn = document.createElement('button');
        btn.title                = champ;
        btn.style.backgroundImage     = `url('assets/${champ}.jpg')`;
        btn.style.backgroundSize      = 'cover';
        btn.style.backgroundPosition  = 'center';
        btn.onclick              = () => submitPick(champ);
        poolDiv.appendChild(btn);
    });
}

// -------------------------
// Submit a pick/ban to Firestore
// -------------------------
function submitPick(champion) {
    // First get the latest step & confirm in bounds
    seriesRef.get().then(doc => {
        const data = doc.data();
        const step = data.currentStep || 0;

        if (step >= draftSequence.length) {
            return alert('Draft is already complete.');
        }

        const { action, team, slot } = draftSequence[step];
        const entry = {
            action,
            team,
            slot,
            champion,
            ts: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Build batched update
        const updates = {
            currentStep:    firebase.firestore.FieldValue.increment(1),
            usedChampions:  firebase.firestore.FieldValue.arrayUnion(champion)
        };
        // Push into picks or bans array
        updates[action === 'PICK' ? 'picks' : 'bans'] =
            firebase.firestore.FieldValue.arrayUnion(entry);

        // Atomically update Firestore
        seriesRef.update(updates)
            .then(() => console.log(`✓ ${action} ${champion} by ${team} in ${slot}`))
            .catch(err => console.error('Failed to submit pick/ban', err));
    });
}

// -------------------------
// Copy-ID button helper
// -------------------------
function setupCopyButton(gameId) {
    const btn = document.getElementById('copy-id-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        navigator.clipboard?.writeText(gameId)
            .then(() => {
                btn.innerText = 'Copied!';
                setTimeout(() => btn.innerText = '📋 Copy ID', 1500);
            })
            .catch(() => alert('Copy failed—please copy manually.'));
    });
}
