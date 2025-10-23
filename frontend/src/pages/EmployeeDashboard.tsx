import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';
import './EmployeeDashboard.css';
import NotificationToast from '../components/NotificationToast';

interface Geofence {
  _id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  description?: string;
}

interface Attendance {
  _id: string;
  status: 'check-in' | 'check-out';
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  geofenceId: {
    _id: string;
    name: string;
  };
}

interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy: {
    name: string;
  };
}

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number, accuracy?: number} | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Auto check-in control
  const autoCheckInDoneRef = useRef<boolean>(false);
  const lastAutoAttemptRef = useRef<number>(0);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMountedRef.current) {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        }
      },
      (error) => {
        if (isMountedRef.current) {
          console.error('Error getting location:', error);
          setError('Unable to get your current location. Please enable location services.');
        }
      },
      {
        timeout: 15000,
        maximumAge: 30000, // 30 seconds to avoid stale readings
        enableHighAccuracy: true
      }
    );
  }, []);

  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (isMountedRef.current) {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        }
      },
      (error) => {
        if (isMountedRef.current) {
          console.error('Watch position error:', error);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // 10 seconds cache
        timeout: 15000,
      }
    );
  }, []);

  const fetchGeofences = useCallback(async () => {
    try {
      const response = await api.get('/geofence');
      if (isMountedRef.current) {
        setGeofences(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching geofences:', error);
      }
    }
  }, []);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const response = await api.get('/attendance/my-history?limit=5');
      if (isMountedRef.current) {
        setAttendanceHistory(response.data.attendance);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching attendance history:', error);
      }
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await api.get('/announcements?limit=5');
      if (isMountedRef.current) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching announcements:', error);
      }
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Determine if two timestamps are on the same calendar day
  const isSameDay = (a: string | Date, b: Date) => {
    const da = new Date(a);
    return (
      da.getFullYear() === b.getFullYear() &&
      da.getMonth() === b.getMonth() &&
      da.getDate() === b.getDate()
    );
  };

  // Find nearest geofence within range
  const findNearestGeofenceInRange = useCallback((): { geofence: Geofence; distance: number } | null => {
    if (!currentLocation || geofences.length === 0) return null;
    // If GPS accuracy is very poor (>100m), avoid declaring in-range to prevent false positives
    if (currentLocation.accuracy !== undefined && currentLocation.accuracy > 100) {
      return null;
    }

    let nearest: { geofence: Geofence; distance: number } | null = null;
    for (const g of geofences) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        g.center.latitude,
        g.center.longitude
      );
      const baseRadius = Number(g.radius) || 0;
      // Cap accuracy buffer to a small value to avoid inflating the geofence excessively
      const accuracyBuffer = Math.min(currentLocation.accuracy ?? 0, 25);
      const effectiveRadius = baseRadius + accuracyBuffer;
      if (distance <= effectiveRadius) {
        if (!nearest || distance < nearest.distance) {
          nearest = { geofence: g, distance };
        }
      }
    }
    return nearest;
  }, [currentLocation, geofences]);

  const markAttendance = useCallback(async (status: 'check-in' | 'check-out') => {
    if (!selectedGeofence) {
      setError('Please select a geofence location');
      return;
    }

    if (!currentLocation) {
      setError('Unable to get your current location');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/attendance/mark', {
        geofenceId: selectedGeofence,
        status,
        location: currentLocation
      });

      if (isMountedRef.current) {
        setSuccess(`Successfully ${status === 'check-in' ? 'checked in' : 'checked out'}!`);
        fetchAttendanceHistory();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        const msg = error.response?.data?.message || 'Failed to mark attendance';
        // Treat duplicate check-in as a non-blocking info for UX
        if (msg.toLowerCase().includes('already checked in')) {
          setSuccess('Already checked in');
          setError('');
        } else {
          setError(msg);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [selectedGeofence, currentLocation, fetchAttendanceHistory]);

  // Internal helper to mark attendance for a specific geofence (used by auto check-in)
  const markAttendanceForGeofence = useCallback(
    async (geofenceId: string, status: 'check-in' | 'check-out') => {
      if (!currentLocation) {
        setError('Unable to get your current location');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        await api.post('/attendance/mark', {
          geofenceId,
          status,
          location: currentLocation,
        });

        if (isMountedRef.current) {
          setSuccess(
            `Successfully ${status === 'check-in' ? 'checked in' : 'checked out'}!`
          );
          fetchAttendanceHistory();
          // Prevent repeated auto check-ins in the same session
          autoCheckInDoneRef.current = true;
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          const msg = error.response?.data?.message || 'Failed to mark attendance';
          // Treat duplicate check-in as a non-blocking info for UX (auto flow)
          if (msg.toLowerCase().includes('already checked in')) {
            setSuccess('Already checked in');
            setError('');
            autoCheckInDoneRef.current = true;
          } else {
            setError(msg);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [currentLocation, fetchAttendanceHistory]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchGeofences();
    fetchAttendanceHistory();
    fetchAnnouncements();
    getCurrentLocation();
    startLocationWatch();

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [fetchGeofences, fetchAttendanceHistory, fetchAnnouncements, getCurrentLocation, startLocationWatch]);

  // Auto check-in effect
  useEffect(() => {
    if (!currentLocation || geofences.length === 0) return;

    const now = Date.now();
    // Throttle attempts to once per 20 seconds so it reacts faster
    if (now - lastAutoAttemptRef.current < 20000) return;
    lastAutoAttemptRef.current = now;

    const last = attendanceHistory[0];
    const today = new Date();
    const currentlyCheckedInToday =
      last?.status === 'check-in' && isSameDay(last.timestamp, today);
    if (currentlyCheckedInToday) {
      autoCheckInDoneRef.current = true;
      return;
    }

    const nearest = findNearestGeofenceInRange();
    if (nearest && !autoCheckInDoneRef.current && !loading) {
      // Preselect the geofence for UI clarity
      setSelectedGeofence((prev) => prev || nearest.geofence._id);
      // Attempt auto check-in
      markAttendanceForGeofence(nearest.geofence._id, 'check-in');
      autoCheckInDoneRef.current = true;
    }
  }, [currentLocation, geofences, attendanceHistory, loading, findNearestGeofenceInRange, markAttendanceForGeofence]);

  // Reset auto-check-in allowance when last record is a check-out or when a new day starts
  useEffect(() => {
    const last = attendanceHistory[0];
    const today = new Date();
    if (!last) {
      autoCheckInDoneRef.current = false;
      return;
    }
    const lastIsToday = isSameDay(last.timestamp, today);
    if (!lastIsToday) {
      autoCheckInDoneRef.current = false;
      return;
    }
    if (last.status === 'check-out') {
      autoCheckInDoneRef.current = false;
    }
  }, [attendanceHistory]);

  const isWithinGeofence = (geofence: Geofence) => {
    if (!currentLocation) return false;
    // If GPS accuracy is very poor (>100m), treat as not reliably in-range
    if (currentLocation.accuracy !== undefined && currentLocation.accuracy > 100) return false;
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      geofence.center.latitude,
      geofence.center.longitude
    );
    const baseRadius = Number(geofence.radius) || 0;
    // Only apply a small cap to mitigate tiny GPS jitter; avoid large inflation
    const accuracyBuffer = Math.min(currentLocation.accuracy ?? 0, 25);
    const effectiveRadius = baseRadius + accuracyBuffer;
    return distance <= effectiveRadius;
  };

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const selectedGeofenceObj = selectedGeofence
    ? geofences.find(g => g._id === selectedGeofence)
    : undefined;

  // Derived UI helpers (no API/logic changes)
  const lastRecord = attendanceHistory[0];
  const inRangeForSelected = selectedGeofenceObj ? isWithinGeofence(selectedGeofenceObj) : false;
  const distanceToSelected = useMemo(() => {
    if (!selectedGeofenceObj || !currentLocation) return null;
    return Math.round(
      calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedGeofenceObj.center.latitude,
        selectedGeofenceObj.center.longitude
      )
    );
  }, [selectedGeofenceObj, currentLocation]);
  const nearestAny = useMemo(() => {
    if (!currentLocation || geofences.length === 0) return null;
    let best: { geofence: Geofence; distance: number } | null = null;
    for (const g of geofences) {
      const d = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        g.center.latitude,
        g.center.longitude
      );
      if (!best || d < best.distance) best = { geofence: g, distance: d };
    }
    return best;
  }, [currentLocation, geofences]);

  return (
    <div className="employee-dashboard glass-employee">
      {/* Background particles for employee glass theme */}
      <div className="particles" aria-hidden="true">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>{user?.name || 'Employee'}</h1>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>

      <main className="dashboard-main">
        <div className="toast-container">
          {success && (
            <NotificationToast
              message={success}
              type="success"
              onClose={() => setSuccess('')}
            />
          )}
          {error && (
            <NotificationToast
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}
        </div>

        {/* Quick Stats Row (structure only, uses existing styles) */}
        <div className="dashboard-grid">
          <div className="stats-card">
            <h3>Current Status</h3>
            <div className="stat-number">
              {lastRecord ? (lastRecord.status === 'check-in' ? 'Checked In' : 'Checked Out') : 'N/A'}
            </div>
            <div className="attendance-time">
              {lastRecord ? new Date(lastRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
            </div>
          </div>
          <div className="stats-card">
            <h3>Selected Geofence</h3>
            <div className="stat-number">
              {selectedGeofenceObj ? selectedGeofenceObj.name : 'None'}
            </div>
            <div className="attendance-time">
              {selectedGeofenceObj ? (inRangeForSelected ? 'In Range' : 'Out of Range') : '—'}
            </div>
            <div className="attendance-time">
              {selectedGeofenceObj && distanceToSelected !== null ? `Distance: ${distanceToSelected} m` : '—'}
            </div>
          </div>
          <div className="stats-card">
            <h3>Nearest Geofence</h3>
            <div className="stat-number">{nearestAny?.geofence.name || '—'}</div>
            <div className="attendance-time">
              {nearestAny ? `${Math.round(nearestAny.distance)} m` : '—'}
            </div>
          </div>
          <div className="stats-card">
            <h3>Current Location</h3>
            {currentLocation ? (
              <div className="map-wrapper">
                <iframe
                  className="map-embed"
                  src={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Current location map"
                />
                <div className="attendance-time" style={{ padding: '8px 4px' }}>
                  {`Accuracy: ${Math.round(currentLocation.accuracy ?? 0)} m`}
                  {distanceToSelected !== null ? ` • Distance to selected: ${distanceToSelected} m` : ''}
                </div>
              </div>
            ) : (
              <div className="attendance-time">Waiting for permission</div>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        <section className="attendance">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Mark Attendance</h2>
              <div className="form-group">
                <label htmlFor="geofence">Select Location</label>
                <select
                  id="geofence"
                  value={selectedGeofence}
                  onChange={(e) => setSelectedGeofence(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a location</option>
                  {geofences.map((geofence) => (
                    <option key={geofence._id} value={geofence._id}>
                      {geofence.name} {isWithinGeofence(geofence) ? '✓ (In Range)' : '✗ (Out of Range)'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGeofence && (
                <div className="geofence-status">
                  {geofences.find(g => g._id === selectedGeofence) && (
                    <p className={isWithinGeofence(geofences.find(g => g._id === selectedGeofence)!) ? 'status-success' : 'status-error'}>
                      {isWithinGeofence(geofences.find(g => g._id === selectedGeofence)!) 
                        ? '✓ You are within the geofence area' 
                        : '✗ You are outside the geofence area'}
                    </p>
                  )}
                </div>
              )}

              <div className="attendance-buttons">
                <button
                  onClick={() => markAttendance('check-in')}
                  disabled={!selectedGeofence || loading || (selectedGeofenceObj ? !isWithinGeofence(selectedGeofenceObj) : false)}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : 'Check In'}
                </button>
                <button
                  onClick={() => markAttendance('check-out')}
                  disabled={loading || !selectedGeofence}
                  className="btn btn-danger"
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </button>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="dashboard-card">
              <h2>Recent Attendance</h2>
              <div className="attendance-list">
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record) => (
                    <div key={record._id} className="attendance-item">
                      <div className="attendance-info">
                        <strong>{record.geofenceId?.name || 'Unknown Location'}</strong>
                        <span className={`status-badge status-${record.status}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="attendance-time">
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No attendance records found</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section>
          <div className="dashboard-grid">
            <div className="dashboard-card announcements-card">
              <h2>Latest Announcements</h2>
              <div className="announcements-list">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement._id} className="announcement-card">
                      <div className="announcement-header">
                        <h3>{announcement.title}</h3>
                        <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="announcement-message">{announcement.message}</p>
                      <div className="announcement-footer">
                        <span className="announcement-author">By {announcement.createdBy.name}</span>
                        <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No announcements available</p>
                )}
              </div>
            </div>
          </div>
        </section>
        
      </main>
      <footer style={{ textAlign: 'center', padding: '15px', opacity: 0.9 }}>
        2025 Smart Attendance Tracker. All rights reserved.
      </footer>
      </div>
    </div>
);

};

export default EmployeeDashboard;
