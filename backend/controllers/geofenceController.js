const Geofence = require('../models/Geofence');

// @desc    Create new geofence
// @route   POST /api/geofence
// @access  Private/Admin
const createGeofence = async (req, res) => {
  try {
    const { name, center, radius, description } = req.body;

    const geofence = await Geofence.create({
      name,
      center,
      radius,
      description
    });

    res.status(201).json(geofence);
  } catch (error) {
    console.error('Create geofence error:', error);
    res.status(500).json({ message: 'Server error creating geofence' });
  }
};

// @desc    Get all geofences
// @route   GET /api/geofence
// @access  Private
const getAllGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(geofences);
  } catch (error) {
    console.error('Get geofences error:', error);
    res.status(500).json({ message: 'Server error fetching geofences' });
  }
};

// @desc    Get single geofence
// @route   GET /api/geofence/:id
// @access  Private
const getGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    res.json(geofence);
  } catch (error) {
    console.error('Get geofence error:', error);
    res.status(500).json({ message: 'Server error fetching geofence' });
  }
};

// @desc    Update geofence
// @route   PUT /api/geofence/:id
// @access  Private/Admin
const updateGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    const updatedGeofence = await Geofence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedGeofence);
  } catch (error) {
    console.error('Update geofence error:', error);
    res.status(500).json({ message: 'Server error updating geofence' });
  }
};

// @desc    Delete geofence
// @route   DELETE /api/geofence/:id
// @access  Private/Admin
const deleteGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    // Soft delete - mark as inactive
    await Geofence.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Geofence deleted successfully' });
  } catch (error) {
    console.error('Delete geofence error:', error);
    res.status(500).json({ message: 'Server error deleting geofence' });
  }
};

module.exports = {
  createGeofence,
  getAllGeofences,
  getGeofence,
  updateGeofence,
  deleteGeofence
};
