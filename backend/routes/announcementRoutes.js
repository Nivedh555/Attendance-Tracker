const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/announcements - Get all announcements
router.get('/', getAllAnnouncements);

// GET /api/announcements/:id - Get single announcement
router.get('/:id', getAnnouncement);

// Admin only routes
router.post('/', adminOnly, createAnnouncement);
router.put('/:id', adminOnly, updateAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

module.exports = router;
