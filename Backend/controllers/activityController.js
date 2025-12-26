const Activity = require("../models/Activity");
const Field = require("../models/Field");

// ================= GET FIELD ACTIVITIES =================
exports.getFieldActivities = async (req, res) => {
  try {
    const { fieldId } = req.query;

    const activities = await Activity.find({
      field: fieldId,
      user: req.user.id,
      isDeleted: { $ne: true }
    }).sort({ activityDate: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities" });
  }
};

// ================= ADD ACTIVITY =================
exports.addActivity = async (req, res) => {
  try {
    const { fieldId } = req.body;

    const fieldExists = await Field.findOne({
      _id: fieldId,
      user: req.user.id
    });

    if (!fieldExists)
      return res.status(404).json({ message: "Field not found" });

    const activity = await Activity.create({
      ...req.body,
      field: fieldId,
      user: req.user.id,
      cost: Number(req.body.cost) || 0,
      revenue: Number(req.body.revenue) || 0
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error adding activity" });
  }
};

// ================= GET ACTIVITY BY ID =================
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity" });
  }
};

// ================= UPDATE ACTIVITY =================
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error updating activity" });
  }
};

// ================= UPDATE STATUS =================
exports.updateActivityStatus = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { status: "Completed" } },
      { new: true }
    );

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

// ================= SOFT DELETE =================
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json({ message: "Moved to bin" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting activity" });
  }
};

// ================= BIN: GET DELETED =================
exports.getDeletedActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      user: req.user.id,
      isDeleted: true
    })
    .populate('field', 'fieldName') // <--- ADD THIS LINE
    .sort({ deletedAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deleted activities" });
  }
};

// ================= BIN: RESTORE =================
exports.restoreActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json({ message: "Activity restored" });
  } catch (error) {
    res.status(500).json({ message: "Restore failed" });
  }
};
