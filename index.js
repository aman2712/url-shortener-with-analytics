import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, connectRedis } from "./utils/db.js";
import urlRoutes from "./routes/urlRoutes.js";

import path from 'path'
import { fileURLToPath } from 'url';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Route to explicitly serve index.html for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.use("/api", urlRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
