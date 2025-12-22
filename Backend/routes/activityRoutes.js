const express = require('express');
const router = express.Router();
// ✅ Added deleteActivity to the import list
const { addActivity, getFieldActivities, updateActivityStatus, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addActivity);
router.get('/:fieldId', protect, getFieldActivities);

// Route for marking as completed
router.patch('/:id', protect, updateActivityStatus);

// ✅ NEW: Route to move activity to backup
router.patch('/:id/delete', protect, deleteActivity);

module.exports = router;