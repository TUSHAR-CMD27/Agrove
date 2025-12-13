const Field = require('../models/Field');
const Activity = require('../models/Activity'); // ✅ Import Activity Model

// @desc    Get all fields + Financial Summaries for the Dashboard
// @route   GET /api/fields
// @access  Private
exports.getMyFields = async (req, res) => {
  try {
    // 1. Fetch all fields for this user
    const fields = await Field.find({ user: req.user.id }).sort({ createdAt: -1 });

    // 2. Calculate Financials for EACH field
    // We use Promise.all to run these database calculations in parallel
    const fieldsWithStats = await Promise.all(fields.map(async (field) => {
      // Find all activities linked to this specific field
      const activities = await Activity.find({ field: field._id });

      // Sum up Cost and Revenue from those activities
      const totalCost = activities.reduce((acc, act) => acc + (act.cost || 0), 0);
      const totalRevenue = activities.reduce((acc, act) => acc + (act.revenue || 0), 0);

      // Return the original field data PLUS the new financial stats
      return { 
        ...field.toObject(), 
        totalCost, 
        totalRevenue,
        netProfit: totalRevenue - totalCost
      };
    }));
    
    // 3. Send the enhanced data back to the dashboard
    res.status(200).json(fieldsWithStats);

  } catch (error) {
    console.error("Error fetching fields:", error);
    res.status(500).json({ message: 'Server Error fetching fields' });
  }
};

// @desc    Add a new field
// @route   POST /api/fields
// @access  Private
exports.addField = async (req, res) => {
  try {
    const { 
      fieldName, areaSize, soilType, currentCrop, 
      waterAvailability, fieldImage, recommendedCrops, waterRequirement 
    } = req.body;

    if (!fieldName || !areaSize || !soilType || !currentCrop) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const field = await Field.create({
      user: req.user.id,
      fieldName,
      areaSize,
      soilType,
      currentCrop,
      waterAvailability,
      fieldImage,
      recommendedCrops,
      waterRequirement
    });

    res.status(201).json(field);
  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).json({ message: error.message || 'Server Error adding field' });
  }
};

// @desc    Get single field by ID
// @route   GET /api/fields/:id
exports.getFieldById = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (field) {
      res.json(field);
    } else {
      res.status(404).json({ message: 'Field not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};