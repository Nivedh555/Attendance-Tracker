# Smart Attendance Tracker with Geofencing

A full-stack MERN application that enables employees to mark attendance with geofence validation and provides administrators with comprehensive management tools.

## 🚀 Features

### Employee Features
- **Secure Authentication**: JWT-based login/registration system
- **Geofence Validation**: Mark attendance only within designated areas
- **Real-time Location**: GPS-based location verification
- **Attendance History**: View personal attendance records
- **Announcements**: Receive important updates from administrators

### Admin Features
- **User Management**: View all registered users with role-based access
- **Geofence Management**: Create, update, and delete geofenced areas
- **Attendance Monitoring**: View all attendance logs with filtering options
- **Announcement System**: Post announcements with priority levels
- **Dashboard Analytics**: User statistics and attendance insights

## 🛠️ Tech Stack

### Frontend
- **React.js** with TypeScript
- **React Router DOM** for navigation
- **Axios** for API communication
- **CSS Modules** with Poppins font
- **Responsive Design** with modern gradients

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **geolib** for geofence calculations
- **CORS** enabled for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-attendance-tracker
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `GET /users` - Get all users (Admin only)
- `GET /count` - Get user statistics (Admin only)

### Geofence Routes (`/api/geofence`)
- `GET /` - Get all geofences
- `GET /:id` - Get single geofence
- `POST /` - Create geofence (Admin only)
- `PUT /:id` - Update geofence (Admin only)
- `DELETE /:id` - Delete geofence (Admin only)

### Attendance Routes (`/api/attendance`)
- `POST /mark` - Mark attendance (check-in/out)
- `GET /my-history` - Get user's attendance history
- `GET /all` - Get all attendance logs (Admin only)
- `GET /stats` - Get attendance statistics (Admin only)

### Announcement Routes (`/api/announcements`)
- `GET /` - Get all announcements
- `GET /:id` - Get single announcement
- `POST /` - Create announcement (Admin only)
- `PUT /:id` - Update announcement (Admin only)
- `DELETE /:id` - Delete announcement (Admin only)

## 🎨 UI Features

### Modern Design Elements
- **Gradient Headers**: Beautiful color transitions
- **Card-based Layout**: Clean, organized interface
- **Role Badges**: Visual distinction between admin/employee
- **Responsive Tables**: Mobile-friendly data display
- **Hover Animations**: Interactive feedback
- **Loading States**: User-friendly loading indicators

### Styling Highlights
- **Poppins Font**: Modern, readable typography
- **Global Background**: Subtle texture overlay
- **Custom Scrollbars**: Styled scroll elements
- **Focus States**: Accessibility-compliant focus indicators
- **Smooth Transitions**: Enhanced user experience

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Role-based Access**: Admin vs Employee permissions
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error management

## 📱 Geofencing Logic

The application uses the `geolib` library to calculate distances between user location and geofence centers:

1. **Location Acquisition**: Browser's Geolocation API
2. **Distance Calculation**: Haversine formula for accurate measurements
3. **Boundary Validation**: Check if user is within specified radius
4. **Real-time Feedback**: Immediate validation results

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the production version:
```bash
npm run build
```
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure environment variables for production API

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin/employee),
  createdAt: Date
}
```

### Geofence Model
```javascript
{
  name: String,
  center: {
    latitude: Number,
    longitude: Number
  },
  radius: Number,
  description: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Attendance Model
```javascript
{
  userId: ObjectId (ref: User),
  geofenceId: ObjectId (ref: Geofence),
  status: String (check-in/check-out),
  location: {
    latitude: Number,
    longitude: Number
  },
  timestamp: Date,
  notes: String
}
```

### Announcement Model
```javascript
{
  title: String,
  message: String,
  priority: String (low/medium/high),
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using the MERN Stack**
