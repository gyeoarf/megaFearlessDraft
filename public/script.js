// Generate a random alphanumeric game ID
function generateGameId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Called when "Create a Fearless series" is clicked
function startNewGame() {
    const gameId = generateGameId();
    alert(`New game created!\nGame ID: ${gameId}`);

    // Redirect to draft page with game ID in URL
    window.location.href = `draft.html?game=${gameId}`;
}

// Called when "Join a Fearless series" is clicked
function joinGame() {
    const gameId = prompt('Enter the Game ID to join:');

    if (!gameId || gameId.trim() === '') {
        alert('You must enter a valid game ID.');
        return;
    }

    // Normalize input
    const cleanId = gameId.trim().toUpperCase();

    // Redirect to draft page with game ID
    window.location.href = `draft.html?game=${cleanId}`;
}

