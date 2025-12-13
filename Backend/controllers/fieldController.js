const Field = require('../models/Field');

// @desc    Get all fields for the logged-in user
// @route   GET /api/fields
// @access  Private
exports.getMyFields = async (req, res) => {
  try {
    // 1. Find fields where the 'user' matches the ID from the token (req.user.id)
    // 2. Sort them by newest first (createdAt: -1)
    const fields = await Field.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json(fields);
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
    // 1. Destructure all the data coming from the Frontend Form
    const { 
      fieldName, 
      areaSize, 
      soilType, 
      currentCrop, 
      waterAvailability, 
      fieldImage,       // The Avatar URL
      recommendedCrops, // Auto-filled smart data
      waterRequirement  // Auto-filled smart data
    } = req.body;

    // 2. Basic Validation: Ensure critical fields are present
    if (!fieldName || !areaSize || !soilType || !currentCrop) {
      return res.status(400).json({ message: 'Please fill in all required fields (Name, Area, Soil, Crop)' });
    }

    // 3. Create the Field in MongoDB
    const field = await Field.create({
      user: req.user.id, // IMPORTANT: Links this field to the logged-in user
      fieldName,
      areaSize,
      soilType,
      currentCrop,
      waterAvailability,
      fieldImage,
      recommendedCrops,
      waterRequirement
    });

    // 4. Send back the created field data
    res.status(201).json(field);

  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).json({ message: error.message || 'Server Error adding field' });
  }
};