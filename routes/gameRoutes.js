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

    let playerScoreChange = 0;
    let computerScoreChange = 0;

    if (result === 'Win') playerScoreChange = 1;
    if (result === 'Lose') computerScoreChange = 1;

    // Save individual game result
    const newGame = new Game({ playerName, playerMove, computerMove, result });
    await newGame.save();

    // Update total player score
    await Game.updateOne(
        { playerName },
        { $inc: { score: playerScoreChange } },
        { upsert: true }
    );
    

    // Update total computer score
    await Game.updateOne(
        { playerName: "Computer" },
        { $inc: { score: computerScoreChange } },
        { upsert: true }
    );
    

    console.log("✅ Game result saved:", newGame);

    res.json({ playerMove, computerMove, result, playerScore: player.score, computerScore: computer.score });
});

// 🏆 Fetch Leaderboard (Shows Player & Computer Scores)
router.get('/leaderboard', async (req, res) => {
    const leaderboard = await Game.aggregate([
        {
            $group: {
                _id: "$playerName",
                score: { $sum: "$score" } // Sum up scores
            }
        },
        { $sort: { score: -1 } }
    ]);

    res.json(leaderboard);
});

// 🔄 Reset all game records on refresh
router.post('/reset', async (req, res) => {
    await Game.updateMany({}, { $set: { score: 0 } }); // Resets scores but keeps past games
    res.json({ message: "Scores reset successfully" });
});


module.exports = router;
