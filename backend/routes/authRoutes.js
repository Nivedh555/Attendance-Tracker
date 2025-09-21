const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  getTotalUsers,
  getMe
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin only routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/count', protect, adminOnly, getTotalUsers);

module.exports = router;
