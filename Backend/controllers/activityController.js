const Activity = require("../models/Activity");
const Field = require("../models/Field");

exports.addActivity = async (req, res) => {
  try {
    const {
      fieldId,
      activityType,
      activityDate,
      status,
      productName,
      quantity,
      unit,
      cost,
      revenue,
      notes,
    } = req.body;

    const field = await Field.findById(fieldId)
    if (!field) return res.status(401).json({message:'Field not found'})

    if (field.user.toString()!== req.user.id){
        return res.status(401).json({ message: 'Not authorized' });
    }

    const activity = await Activity.create({
      user: req.user.id,
      field: fieldId,
      activityType,
      activityDate,
      status,
      productName,
      quantity,
      unit,
      cost: Number(cost),
      revenue: Number(revenue),
      notes
    });
    res.status(201).json(activity);

  }
   catch (err) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding activity' });
   }
};

exports.getFieldActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ field: req.params.fieldId }).sort({ activityDate: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
}
// ... existing imports and functions ...

// @desc    Update activity status to Completed
// @route   PATCH /api/activities/:id
exports.updateActivityStatus = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Verify user owns this activity
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Force status to Completed
    activity.status = 'Completed';
    const updatedActivity = await activity.save();

    res.json(updatedActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating status' });
  }
};
