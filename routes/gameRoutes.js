const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

function getComputerMove() {
    const moves = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * moves.length)];
}

function determineWinner(playerMove, computerMove) {
    if (playerMove === computerMove) return 'Draw';
    if (
        (playerMove === 'rock' && computerMove === 'scissors') ||
        (playerMove === 'paper' && computerMove === 'rock') ||
        (playerMove === 'scissors' && computerMove === 'paper')
    ) {
        return 'Win';
    }
    return 'Lose';
}

router.post('/play', async (req, res) => {
    const { playerName, playerMove } = req.body;
    if (!playerName) return res.status(400).json({ error: "Player name is required!" });

    const computerMove = getComputerMove();
    const result = determineWinner(playerMove, computerMove);

    let playerScoreChange = result === 'Win' ? 1 : 0;
    let computerScoreChange = result === 'Lose' ? 1 : 0;

    // ✅ Save individual game result
    const newGame = new Game({ playerName, playerMove, computerMove, result });
    await newGame.save();

    // ✅ Update total player score in a single document
    await Game.findOneAndUpdate(
        { playerName },  // Find by player name
        { $inc: { score: playerScoreChange } },  // Increment the score
        { upsert: true, new: true }  // Create if doesn't exist
    );

    // ✅ Ensure only one entry for "Computer"
    await Game.findOneAndUpdate(
        { playerName: "Computer" },
        { $inc: { score: computerScoreChange } },
        { upsert: true, new: true }
    );

    // ✅ Fetch updated scores
    const updatedPlayer = await Game.findOne({ playerName }) || { score: 0 };
    const updatedComputer = await Game.findOne({ playerName: "Computer" }) || { score: 0 };

    res.json({
        playerMove,
        computerMove,
        result,
        playerScore: updatedPlayer.score,
        computerScore: updatedComputer.score
    });
});


// 🏆 **Leaderboard Route (Shows Players & Computer Scores)**
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Game.aggregate([
            {
                $group: {
                    _id: { $toLower: "$playerName" }, // Convert names to lowercase
                    score: { $sum: "$score" } // Sum up scores
                }
            },
            { $sort: { score: -1 } }
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
        res.status(500).json({ error: "Failed to load leaderboard" });
    }
});

// 🔄 **Reset Scores Without Deleting Game History**
router.post('/reset', async (req, res) => {
    try {
        await Game.deleteMany({}); // 🔥 Deletes ALL player records (full reset)
        res.json({ message: "All player data reset successfully" });
    } catch (error) {
        console.error("❌ Error resetting game data:", error);
        res.status(500).json({ error: "Failed to reset game data" });
    }
});


module.exports = router;
