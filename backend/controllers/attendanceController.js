const Attendance = require('../models/Attendance');
const Geofence = require('../models/Geofence');
const { isPointWithinRadius } = require('geolib');

// @desc    Mark attendance (check-in/check-out)
// @route   POST /api/attendance/mark
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const { geofenceId, status, location, notes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!geofenceId || !status || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get geofence details
    const geofence = await Geofence.findById(geofenceId);
    if (!geofence || !geofence.isActive) {
      return res.status(404).json({ message: 'Geofence not found or inactive' });
    }

    // Check if user is within geofence
    const userLocation = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    const geofenceCenter = {
      latitude: geofence.center.latitude,
      longitude: geofence.center.longitude
    };

    const isWithinGeofence = isPointWithinRadius(
      userLocation,
      geofenceCenter,
      geofence.radius
    );

    if (!isWithinGeofence) {
      return res.status(400).json({ 
        message: 'You are not within the required geofence area',
        distance: 'outside_radius'
      });
    }

    // Check for duplicate check-ins (prevent multiple check-ins without check-out)
    if (status === 'check-in') {
      const lastAttendance = await Attendance.findOne({ 
        userId, 
        geofenceId 
      }).sort({ createdAt: -1 });

      if (lastAttendance && lastAttendance.status === 'check-in') {
        return res.status(400).json({ 
          message: 'You are already checked in. Please check out first.' 
        });
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId,
      geofenceId,
      status,
      location,
      notes
    });

    // Populate user and geofence details for response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('userId', 'name email')
      .populate('geofenceId', 'name');

    res.status(201).json(populatedAttendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
};

// @desc    Get user's attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const attendance = await Attendance.find({ userId })
      .populate('geofenceId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments({ userId });

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
};

// @desc    Get all attendance logs (Admin only)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, geofenceId, status } = req.query;

    // Build filter object
    const filter = {};
    if (userId) filter.userId = userId;
    if (geofenceId) filter.geofenceId = geofenceId;
    if (status) filter.status = status;

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email role')
      .populate('geofenceId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(filter);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance logs' });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private/Admin
const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayCheckIns = await Attendance.countDocuments({
      status: 'check-in',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayCheckOuts = await Attendance.countDocuments({
      status: 'check-out',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Total stats
    const totalAttendance = await Attendance.countDocuments();

    res.json({
      today: {
        checkIns: todayCheckIns,
        checkOuts: todayCheckOuts
      },
      total: totalAttendance
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error fetching attendance statistics' });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceStats
};
