const Field = require('../models/Field');
const Activity = require('../models/Activity');

// @desc    Add a new field
exports.addField = async (req, res) => {
  try {
    const { fieldName, areaSize, soilType, fieldImage, currentCrop } = req.body;
    const field = await Field.create({
      user: req.user.id,
      fieldName,
      areaSize,
      soilType,
      fieldImage,
      currentCrop,
      isDeleted: false,
      expireAt: null
    });
    res.status(201).json(field);
  } catch (error) {
    res.status(400).json({ message: 'Error adding field' });
  }
};

// @desc    Get active fields (Dashboard)
exports.getMyFields = async (req, res) => {
  try {
    const fields = await Field.find({ 
      user: req.user.id, 
      isDeleted: { $ne: true } 
    }).sort({ createdAt: -1 });

    const fieldsWithStats = await Promise.all(fields.map(async (field) => {
      const activities = await Activity.find({ field: field._id, isDeleted: { $ne: true } });
      const totalCost = activities.reduce((acc, act) => acc + (act.cost || 0), 0);
      const totalRevenue = activities.reduce((acc, act) => acc + (act.revenue || 0), 0);
      return { ...field.toObject(), totalCost, totalRevenue, netProfit: totalRevenue - totalCost };
    }));

    res.status(200).json(fieldsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single field details
exports.getFieldById = async (req, res) => {
  try {
    const field = await Field.findOne({ _id: req.params.id, user: req.user.id });
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.status(200).json(field);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching field details' });
  }
};

// @desc    Update field info
exports.updateField = async (req, res) => {
  try {
    const updatedField = await Field.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedField) return res.status(404).json({ message: 'Field not found' });
    res.status(200).json(updatedField);
  } catch (error) {
    res.status(500).json({ message: 'Error updating field' });
  }
};

// @desc    Get trash bin fields
exports.getBinFields = async (req, res) => {
  try {
    const fields = await Field.find({ user: req.user.id, isDeleted: true });
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bin' });
  }
};

// @desc    Move to Bin (30-day timer)
exports.deleteField = async (req, res) => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); 

    const field = await Field.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: true, deletedAt: new Date(), expireAt: expiryDate },
      { new: true }
    );

    if (!field) return res.status(404).json({ message: 'Field not found' });
    await Activity.updateMany({ field: req.params.id }, { isDeleted: true });

    res.status(200).json({ message: 'Field moved to bin for 30 days' });
  } catch (error) {
    res.status(500).json({ message: 'Error moving to bin' });
  }
};

// @desc    Restore field from bin
exports.restoreField = async (req, res) => {
  try {
    const field = await Field.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: false, deletedAt: null, expireAt: null },
      { new: true }
    );

    if (!field) return res.status(404).json({ message: 'Field not found' });
    await Activity.updateMany({ field: req.params.id }, { isDeleted: false });

    res.status(200).json({ message: 'Field restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring field' });
  }
};

// ===================== New: Generate user report =====================
exports.generateReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const fields = await Field.find({ user: userId, isDeleted: { $ne: true } });

    let totalArea = 0;
    let totalCost = 0;
    let totalRevenue = 0;

    const fieldReports = await Promise.all(fields.map(async (field) => {
      const activities = await Activity.find({ field: field._id, isDeleted: { $ne: true } });

      const fieldCost = activities.reduce((acc, act) => acc + (act.cost || 0), 0);
      const fieldRevenue = activities.reduce((acc, act) => acc + (act.revenue || 0), 0);

      totalArea += field.areaSize || 0;
      totalCost += fieldCost;
      totalRevenue += fieldRevenue;

      return {
        fieldName: field.fieldName,
        areaSize: field.areaSize,
        soilType: field.soilType,
        currentCrop: field.currentCrop,
        totalCost: fieldCost,
        totalRevenue: fieldRevenue,
        netProfit: fieldRevenue - fieldCost,
      };
    }));

    const reportSummary = {
      totalFields: fields.length,
      totalArea,
      totalCost,
      totalRevenue,
      netProfit: totalRevenue - totalCost,
    };

    res.status(200).json({ reportSummary, fieldReports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating report" });
  }
};
