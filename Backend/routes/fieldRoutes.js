const express = require('express');
const router = express.Router();
const { getMyFields, addField } = require('../controllers/fieldController');
const { protect } = require('../middlewares/authMiddleware');

// 1. GET request to /api/fields -> Runs 'protect' -> Runs 'getMyFields'
// 2. POST request to /api/fields -> Runs 'protect' -> Runs 'addField'
router.route('/')
  .get(protect, getMyFields)
  .post(protect, addField);

module.exports = router;