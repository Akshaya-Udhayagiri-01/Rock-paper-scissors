const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    playerMove: String,
    computerMove: String,
    result: String,
    score: { type: Number, default: 0 },  // Stores score for each game
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
