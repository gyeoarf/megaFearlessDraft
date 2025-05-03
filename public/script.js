// Utilities
function generateGameId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Create a new Firestore series document, then redirect
function startNewGame() {
    const gameId = generateGameId();
    const seriesRef = db.collection('series').doc(gameId);

    seriesRef.set({
        currentStep:   0,
        usedChampions: [],
        picks:         [],
        bans:          [],
        createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            window.location.href = `draft.html?game=${gameId}`;
        })
        .catch(err => {
            console.error('Error creating series:', err);
            alert('Failed to create series. See console for details.');
        });
}

// Prompt for a code, verify it exists, then redirect
function joinGame() {
    const input = prompt('Enter the Game ID to join:');
    if (!input) return;

    const code = input.trim().toUpperCase();
    const seriesRef = db.collection('series').doc(code);

    seriesRef.get()
        .then(doc => {
            if (!doc.exists) {
                alert(`No Fearless series found with code "${code}".`);
            } else {
                window.location.href = `draft.html?game=${code}`;
            }
        })
        .catch(err => {
            console.error('Error fetching series:', err);
            alert('Failed to join series. See console for details.');
        });
}

// Alias for joinGame (if you want a separate flow)
function loadDraft() {
    joinGame();
}
