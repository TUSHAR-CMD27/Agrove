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

    const field = await Field.findById(fieldId);
    if (!field) return res.status(401).json({ message: 'Field not found' });

    if (field.user.toString() !== req.user.id) {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error adding activity' });
  }
};

// ✅ UPDATED: Added isDeleted: false to the query
exports.getFieldActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ 
      field: req.params.fieldId,
      isDeleted: false // 👈 This filters out the "Backup" items
    }).sort({ activityDate: -1 });
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateActivityStatus = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    activity.status = 'Completed';
    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating status' });
  }
};

// ✅ NEW: Soft Delete function (Move to Backup)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Verify user ownership
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Flip the "Backup" switches
    activity.isDeleted = true;
    activity.deletedAt = new Date();
    await activity.save();

    res.json({ message: 'Activity moved to backup successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during deletion' });
  }
};