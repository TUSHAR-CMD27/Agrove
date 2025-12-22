const express = require('express');
const router = express.Router();

const {
  getFieldActivities,
  addActivity,
  getActivityById,
  updateActivity,
  updateActivityStatus,
  deleteActivity,
  getDeletedActivities,
  restoreActivity
} = require('../controllers/activityController');

const { protect } = require('../middlewares/authMiddleware');

// MAIN
router.route('/')
  .get(protect, getFieldActivities)
  .post(protect, addActivity);

router.route('/:id')
  .get(protect, getActivityById)
  .put(protect, updateActivity);

// STATUS & DELETE
router.patch('/status/:id', protect, updateActivityStatus);
router.patch('/:id/delete', protect, deleteActivity);

// BIN
router.get('/bin/all', protect, getDeletedActivities);
router.patch('/:id/restore', protect, restoreActivity);

module.exports = router;
