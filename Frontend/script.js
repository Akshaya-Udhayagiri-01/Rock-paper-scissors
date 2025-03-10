// Clear previous game data on refresh
localStorage.removeItem("playerName");

let playerName = prompt("Enter your name:");
if (!playerName) playerName = "Guest"; // Default name if empty
localStorage.setItem("playerName", playerName);

async function playGame(playerMove) {
    const response = await fetch('http://localhost:5000/api/game/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, playerMove })
    });

    const data = await response.json();
    document.getElementById('result').innerText = 
        `You: ${data.playerMove} | Computer: ${data.computerMove} | Result: ${data.result}`;

    updateLeaderboard();
}

// 🏆 Fetch & Display Leaderboard (Player & Computer Scores)
async function updateLeaderboard() {
    const response = await fetch('http://localhost:5000/api/game/leaderboard');
    const leaderboard = await response.json();

    let leaderboardHTML = "<h2>Leaderboard</h2><ul>";
    leaderboard.forEach(player => {
        if (player._id) {
            leaderboardHTML += `<li>${player._id}: ${player.score} points</li>`;
        }
    });
    leaderboardHTML += "</ul>";

    document.getElementById('leaderboard').innerHTML = leaderboardHTML;
}


// 🔄 Reset game data on refresh
window.onload = async () => {
    document.getElementById('result').innerText = "Make your move!";
    
    // Clear scores in the database (resets leaderboard)
    await fetch('http://localhost:5000/api/game/reset', { method: 'POST' });

    updateLeaderboard();
};
