const Field = require('../models/Field');
const Activity = require('../models/Activity');

// @desc    Get all fields + Financial Summaries
// @route   GET /api/fields
exports.getMyFields = async (req, res) => {
  try {
    // 1. Fetch only fields that ARE NOT deleted
    const fields = await Field.find({ 
        user: req.user.id, 
        isDeleted: false // ✅ Filter out backups
    }).sort({ createdAt: -1 });

    const fieldsWithStats = await Promise.all(fields.map(async (field) => {
      // 2. Fetch only activities that ARE NOT deleted for this field
      const activities = await Activity.find({ 
          field: field._id, 
          isDeleted: false // ✅ Filter out activity backups
      });

      const totalCost = activities.reduce((acc, act) => acc + (act.cost || 0), 0);
      const totalRevenue = activities.reduce((acc, act) => acc + (act.revenue || 0), 0);

      return { 
        ...field.toObject(), 
        totalCost, 
        totalRevenue,
        netProfit: totalRevenue - totalCost
      };
    }));
    
    res.status(200).json(fieldsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching fields' });
  }
};

// @desc    Soft Delete a field (Move to Backup)
// @route   PATCH /api/fields/:id/delete
exports.deleteField = async (req, res) => {
    try {
      // 1. Mark the field as deleted
      const field = await Field.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
  
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
  
      // 2. Mark all activities for this field as deleted (Cascade Backup)
      await Activity.updateMany(
        { field: req.params.id },
        { isDeleted: true, deletedAt: new Date() }
      );
  
      res.status(200).json({ message: 'Field and activities moved to backup' });
    } catch (error) {
      res.status(500).json({ message: 'Error moving to backup' });
    }
};

// ... keep addField and getFieldById as they are