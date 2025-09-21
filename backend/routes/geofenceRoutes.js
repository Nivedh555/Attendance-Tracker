const express = require('express');
const router = express.Router();
const {
  createGeofence,
  getAllGeofences,
  getGeofence,
  updateGeofence,
  deleteGeofence
} = require('../controllers/geofenceController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/geofence - Get all geofences
router.get('/', getAllGeofences);

// GET /api/geofence/:id - Get single geofence
router.get('/:id', getGeofence);

// Admin only routes
router.post('/', adminOnly, createGeofence);
router.put('/:id', adminOnly, updateGeofence);
router.delete('/:id', adminOnly, deleteGeofence);

module.exports = router;
