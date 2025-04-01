import express from "express";
import shortid from "shortid";
import { Url } from "../models/Url.js";
import { redisClient } from "../utils/db.js";

const router = express.Router();

// POST /shorten - Shorten a URL
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "URL is required" });

  try {
    let url = await Url.findOne({ longUrl });

    if (!url) {
      const shortId = shortid.generate();
      url = new Url({ shortId, longUrl });
      await url.save();
      await redisClient.setEx(shortId, 3600, longUrl);
    }

    res.json({ shortUrl: `${process.env.BASE_URL}/${url.shortId}` });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /:shortId - Redirect to long URL and track clicks
router.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    let longUrl = await redisClient.get(shortId);

    if (!longUrl) {
      const url = await Url.findOne({ shortId });
      if (!url) return res.status(404).json({ error: "URL not found" });

      longUrl = url.longUrl;
      await redisClient.setEx(shortId, 3600, longUrl);
    }

    await Url.findOneAndUpdate({ shortId }, { $inc: { clicks: 1 } });

    res.redirect(longUrl);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /analytics/:shortId - Get click count
router.get("/analytics/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    res.json({ shortId, longUrl: url.longUrl, clicks: url.clicks });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET / - Get list of all shortened ids
router.get('/', async (req, res) => {
  try {
    const ids = await Url.find({}).sort({_id: -1})
    res.json({ids})
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
})

export default router;
