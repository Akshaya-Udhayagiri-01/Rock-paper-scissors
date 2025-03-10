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

    // Fetch updated scores (default to 0 if not found)
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

module.exports = router;
