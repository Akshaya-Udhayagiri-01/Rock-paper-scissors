const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("DEBUG: MONGO_URI =", process.env.MONGO_URI); // Check if .env is loading

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined! Check your .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));


app.use('/api/game', gameRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
