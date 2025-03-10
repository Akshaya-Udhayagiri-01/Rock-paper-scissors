const API_URL = "https://rock-paper-scissors-mvoi.onrender.com"; // ✅ Use your Render backend URL

// Clear previous game data on refresh
localStorage.removeItem("playerName");

let playerName = prompt("Enter your name:");
if (!playerName) playerName = "Guest"; // Default name if empty
localStorage.setItem("playerName", playerName);

async function playGame(playerMove) {
    try {
        const response = await fetch(`${API_URL}/api/game/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, playerMove })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('result').innerText = 
            `You: ${data.playerMove} | Computer: ${data.computerMove} | Result: ${data.result}`;

        updateLeaderboard();
    } catch (error) {
        console.error("Error playing game:", error);
        alert("Failed to connect to the server. Please try again later.");
    }
}

// 🏆 Fetch & Display Leaderboard (Player & Computer Scores)
async function updateLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/game/leaderboard`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const leaderboard = await response.json();
        let leaderboardHTML = "<h2>Leaderboard</h2><ul>";
        leaderboard.forEach(player => {
            if (player._id) {
                leaderboardHTML += `<li>${player._id}: ${player.score} points</li>`;
            }
        });
        leaderboardHTML += "</ul>";

        document.getElementById('leaderboard').innerHTML = leaderboardHTML;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        document.getElementById('leaderboard').innerHTML = "<h2>Leaderboard</h2><p>Error loading leaderboard</p>";
    }
}

// 🔄 Reset game data on refresh
window.onload = async () => {
    document.getElementById('result').innerText = "Make your move!";
    
    try {
        await fetch(`${API_URL}/api/game/reset`, { method: 'POST' });
        updateLeaderboard();
    } catch (error) {
        console.error("Error resetting game data:", error);
    }
};
