const express = require('express');
const router = express.Router();
const { 
  getMyFields, 
  addField, 
  getFieldById, 
  updateField,
  getBinFields, 
  deleteField, 
  restoreField 
} = require('../controllers/fieldController');
const { protect } = require('../middlewares/authMiddleware');

// Base routes: /api/fields
router.route('/')
  .get(protect, getMyFields)
  .post(protect, addField);

// Bin routes: /api/fields/bin
router.get('/bin', protect, getBinFields);

// Specific Field routes: /api/fields/:id
router.route('/:id')
  .get(protect, getFieldById)
  .put(protect, updateField);

// Soft delete actions
router.patch('/:id/delete', protect, deleteField);
router.patch('/:id/restore', protect, restoreField);

module.exports = router;