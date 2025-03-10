const path = require('path');
require('dotenv').config();

console.log("DEBUG: MONGO_URI =", process.env.MONGO_URI || "❌ Not Loaded!"); // Debug log

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000; // ✅ Use Render's assigned port
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined! Check your .env file or Render Environment Variables.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use('/api/game', gameRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
