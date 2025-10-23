import axios from 'axios';

// CORRECT LOGIC: Always use the environment variable if available, otherwise use localhost.
// This reads the REACT_APP_API_URL set in Vercel or falls back to localhost:5001 for local dev
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  // Append '/api' here. Ensure ALL your backend routes start with /api.
  // If only some do, remove '/api' here and add it in each specific call
  // like api.post('/api/auth/register', ...) in AuthContext.tsx
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptors (Keep these as they were) ---

// Add auth token to requests if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use standard 'Authorization' header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Handle global responses, especially auth errors (401)
api.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error) => {
    console.error('API Error:', error.response || error.message || error); // Log the error

    // If response status is 401 (Unauthorized), likely an invalid/expired token
    if (error.response?.status === 401) {
      console.log('Authentication error (401), logging out.');
      // Clear user data from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to the login page
      // Ensure this runs only in the browser
      if (typeof window !== 'undefined') {
         window.location.href = '/login';
      }
    } else if (!error.response) {
      // Network error (server down, CORS issue not caught earlier, etc.)
      console.error('Network error - Backend server may be down or unreachable');
      // You might want to show a generic error message to the user here
    }

    // Return the error so that the calling code (.catch block) can handle it
    return Promise.reject(error);
  }
);

export default api;