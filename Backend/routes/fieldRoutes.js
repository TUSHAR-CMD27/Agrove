const express = require('express');
const router = express.Router();
// ✅ FIXED: Added getFieldById to the import list
const { getMyFields, addField, getFieldById } = require('../controllers/fieldController');
const { protect } = require('../middlewares/authMiddleware');

// 1. GET /api/fields -> Get all my fields
// 2. POST /api/fields -> Add a new field
router.route('/')
  .get(protect, getMyFields)
  .post(protect, addField);

// 3. GET /api/fields/:id -> Get ONE specific field (for details page)
router.route('/:id')
  .get(protect, getFieldById);

module.exports = router;