const express = require('express');
const router = express.Router();
// ✅ Added deleteField to the import list
const { getMyFields, addField, getFieldById, deleteField } = require('../controllers/fieldController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getMyFields)
  .post(protect, addField);

router.route('/:id')
  .get(protect, getFieldById);

// ✅ NEW: Route to move field to backup
router.patch('/:id/delete', protect, deleteField);

module.exports = router;