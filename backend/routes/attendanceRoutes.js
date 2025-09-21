const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// POST /api/attendance/mark - Mark attendance (check-in/check-out)
router.post('/mark', markAttendance);

// GET /api/attendance/my-history - Get user's attendance history
router.get('/my-history', getMyAttendance);

// Admin only routes
router.get('/all', adminOnly, getAllAttendance);
router.get('/stats', adminOnly, getAttendanceStats);

module.exports = router;
