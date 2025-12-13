const express = require('express');
const router = express.Router();
const { addActivity, getFieldActivities,updateActivityStatus } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');


router.post('/', protect, addActivity);


router.get('/:fieldId', protect, getFieldActivities);
router.patch('/:id', protect, updateActivityStatus);

module.exports = router;