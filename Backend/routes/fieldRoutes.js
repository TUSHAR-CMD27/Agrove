const express = require('express');
const router = express.Router();
const { 
  getMyFields, 
  addField, 
  getFieldById, 
  updateField,
  getBinFields, 
  deleteField, 
  restoreField,
  generateReport // <-- import the report function
} = require('../controllers/fieldController');
const { protect } = require('../middlewares/authMiddleware');

// Base routes: /api/fields
router.route('/')
  .get(protect, getMyFields)
  .post(protect, addField);

// Bin routes: /api/fields/bin
router.get('/bin', protect, getBinFields);

// Report route: /api/fields/report
router.get('/report', protect, generateReport);

// --- PROXY ROUTES (Fix CORS) ---
router.get('/proxy/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ message: "Missing lat/lon" });
  try {
    // Nominatim REQUIRES a User-Agent
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'AgroveWeb/1.0' }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Nominatim Proxy Error:", err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

router.get('/proxy/rss', async (req, res) => {
  try {
    const rssUrl = "https://krishijagran.com/rss/market-news/";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("RSS Proxy Error:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});
// -------------------------------

// Specific Field routes: /api/fields/:id
router.route('/:id')
  .get(protect, getFieldById)
  .put(protect, updateField);

// Soft delete actions
router.patch('/:id/delete', protect, deleteField);
router.patch('/:id/restore', protect, restoreField);

module.exports = router;
