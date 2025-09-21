/*
  Seed default admin user if none exists.
  Usage: node scripts/seedAdmin.js
  Env vars used (optional):
  - ADMIN_NAME
  - ADMIN_EMAIL
  - ADMIN_PASSWORD
*/
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

dotenv.config();

(async () => {
  try {
    await connectDB();

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      console.log('Admin already exists. No action taken.');
      process.exit(0);
    }

    const name = process.env.ADMIN_NAME || 'Default Admin';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted existing user ${email} to admin.`);
      } else {
        console.log('User with the provided email is already admin.');
      }
      process.exit(0);
    }

    const admin = await User.create({ name, email, password, role: 'admin' });
    console.log('Admin user created successfully:');
    console.log({ email, password });
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
})();
