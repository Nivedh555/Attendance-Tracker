const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables early
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- Middleware ---

// CORRECTED CORS Configuration
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.error(`CORS Error: Origin '${origin}' not allowed.`); // Log denied origins
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Important for cookies or Authorization headers
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Routes ---
// Ensure these come *after* the CORS middleware
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/geofence', require('./routes/geofenceRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// --- Serve Frontend Statically (Not Recommended for Separate Deployment) ---
// This block serves the frontend build from the backend.
// Since you are deploying frontend to Vercel, this is likely NOT needed.
// Keeping it commented out is safer for separate frontend/backend.
/*
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../frontend/build');
  console.log(`Serving static files from: ${clientBuildPath}`); // Log path for debugging
  app.use(express.static(clientBuildPath));

  // Fallback for SPA routing (make sure this is last route)
  app.get('*', (req, res, next) => {
    // If request starts with /api, it's an API call, let other routes handle it
    if (req.path.startsWith('/api')) return next();
    // Otherwise, serve the frontend's index.html
    const indexPath = path.join(clientBuildPath, 'index.html');
    console.log(`Serving index.html for path: ${req.path}`); // Log fallback serving
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send(err);
      }
    });
  });
} else {
  // Basic API root route for development check
  app.get('/api', (req, res) => { // Changed from '/' to '/api'
    res.json({ message: 'Smart Attendance Tracker API is running in development!' });
  });
}
*/

// If NODE_ENV is not production, add a simple check for the root
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req, res) => {
        res.json({ message: 'Smart Attendance Tracker API is running in development!' });
    });
}


// --- Error Handling Middleware (Keep this last) ---
app.use((err, req, res, next) => {
  console.error('Error Middleware Caught:', err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000; // Use 5000 as default if PORT not set

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});