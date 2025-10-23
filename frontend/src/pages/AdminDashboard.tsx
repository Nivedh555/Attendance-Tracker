import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';
import './AdminDashboard.css';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: string;
}

interface Geofence {
  _id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  description?: string;
  createdAt: string;
}

interface Attendance {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  geofenceId: {
    _id: string;
    name: string;
  };
  status: 'check-in' | 'check-out';
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
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

interface UserStats {
  total: number;
  admin: number;
  employee: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, admin: 0, employee: 0 });
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isMountedRef = useRef(true);
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Form states
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '',
    description: ''
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await api.get('/auth/count');
      if (isMountedRef.current) {
        setUserStats(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching user stats:', error);
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/auth/users');
      if (isMountedRef.current) {
        setUsers(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching users:', error);
      }
    }
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

  const fetchAttendanceLogs = useCallback(async () => {
    try {
      const response = await api.get('/attendance/all?limit=20');
      if (isMountedRef.current) {
        setAttendanceLogs(response.data.attendance);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching attendance logs:', error);
      }
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await api.get('/announcements');
      if (isMountedRef.current) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error fetching announcements:', error);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUserStats();
    fetchUsers();
    fetchGeofences();
    fetchAttendanceLogs();
    fetchAnnouncements();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUserStats, fetchUsers, fetchGeofences, fetchAttendanceLogs, fetchAnnouncements]);

  const createGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/geofence', {
        name: newGeofence.name,
        center: {
          latitude: parseFloat(newGeofence.latitude),
          longitude: parseFloat(newGeofence.longitude)
        },
        radius: parseInt(newGeofence.radius),
        description: newGeofence.description
      });

      if (isMountedRef.current) {
        setSuccess('Geofence created successfully!');
        setNewGeofence({ name: '', latitude: '', longitude: '', radius: '', description: '' });
        fetchGeofences();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setError(error.response?.data?.message || 'Failed to create geofence');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const deleteGeofence = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this geofence?')) return;

    try {
      await api.delete(`/geofence/${id}`);
      if (isMountedRef.current) {
        setSuccess('Geofence deleted successfully!');
        fetchGeofences();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setError(error.response?.data?.message || 'Failed to delete geofence');
      }
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/announcements', newAnnouncement);
      if (isMountedRef.current) {
        setSuccess('Announcement created successfully!');
        setNewAnnouncement({ title: '', message: '', priority: 'medium' });
        fetchAnnouncements();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setError(error.response?.data?.message || 'Failed to create announcement');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      if (isMountedRef.current) {
        setSuccess('Announcement deleted successfully!');
        fetchAnnouncements();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setError(error.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayKey = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dayKeyToLabel = (dayKey: string) => {
    const [y, m, d] = dayKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  };

  // Group attendance by day -> location -> user (merge earliest check-in and latest check-out)
  const groupedAttendance = useMemo(() => {
    const q = attendanceSearch.trim().toLowerCase();
    const filtered = attendanceLogs.filter((log) => {
      if (!q) return true;
      return (
        log.userId.name.toLowerCase().includes(q) ||
        (log.userId.email?.toLowerCase().includes(q) ?? false) ||
        log.geofenceId.name.toLowerCase().includes(q)
      );
    });

    const byDay: Record<string, Record<string, Record<string, { user: string; checkIn?: string; checkOut?: string }>>> = {};

    for (const log of filtered) {
      const dayKey = getDayKey(log.createdAt);
      const location = log.geofenceId.name || 'Unknown';
      const uid = log.userId._id;
      byDay[dayKey] ??= {};
      byDay[dayKey][location] ??= {};
      const entry = byDay[dayKey][location][uid] ?? { user: log.userId.name };
      if (log.status === 'check-in') {
        if (!entry.checkIn || new Date(log.createdAt) < new Date(entry.checkIn)) entry.checkIn = log.createdAt;
      } else if (log.status === 'check-out') {
        if (!entry.checkOut || new Date(log.createdAt) > new Date(entry.checkOut)) entry.checkOut = log.createdAt;
      }
      byDay[dayKey][location][uid] = entry;
    }

    return Object.entries(byDay)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dayKey, byLocation]) => ({
        dayKey,
        dayLabel: dayKeyToLabel(dayKey),
        locations: Object.entries(byLocation)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([location, byUser]) => ({
            location,
            users: Object.entries(byUser)
              .map(([userId, u]) => ({ userId, ...u, classification: u.checkIn && u.checkOut ? 'Complete' : 'Partial' }))
              .sort((a, b) => a.user.localeCompare(b.user)),
          })),
      }));
  }, [attendanceLogs, attendanceSearch]);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Safety check - only render if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Access Denied</h1>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
        <div className="dashboard-main">
          <div className="error-message">
            You don't have permission to access the admin dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard glass-theme">
      {/* Background particles for glass theme */}
      <div className="particles" aria-hidden="true">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <i className="fas fa-shield-alt"></i>
          <span>Admin Panel</span>
        </div>
        <ul className="menu">
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <i className="fas fa-th"></i><span>Overview</span>
          </li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <i className="fas fa-users"></i><span>Users</span>
          </li>
          <li className={activeTab === 'geofences' ? 'active' : ''} onClick={() => setActiveTab('geofences')}>
            <i className="fas fa-map-marker-alt"></i><span>Geofences</span>
          </li>
          <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
            <i className="fas fa-calendar-check"></i><span>Attendance</span>
          </li>
          <li className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>
            <i className="fas fa-bullhorn"></i><span>Announcements</span>
          </li>
        </ul>
        <button onClick={logout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Wrapper */}
      <div className="content">
        <div className="dashboard-container">
      <div className="header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="user-info">
          <div className="user-avatar">{(user?.name?.[0] || 'A').toUpperCase()}</div>
          <div>{user?.name || 'Admin User'}</div>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
        <div className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</div>
        <div className={`tab ${activeTab === 'geofences' ? 'active' : ''}`} onClick={() => setActiveTab('geofences')}>Geofences</div>
        <div className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</div>
        <div className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>Announcements</div>
      </div>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'overview' && (
          <>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-icon users-icon"><i className="fas fa-users"></i></div>
                </div>
                <div className="stat-value">{userStats.total}</div>
                <div className="stat-change"><i className="fas fa-minus"></i> No change</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Admins</div>
                  <div className="stat-icon admins-icon"><i className="fas fa-user-shield"></i></div>
                </div>
                <div className="stat-value">{userStats.admin}</div>
                <div className="stat-change"><i className="fas fa-minus"></i> No change</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Employees</div>
                  <div className="stat-icon employees-icon"><i className="fas fa-user-tie"></i></div>
                </div>
                <div className="stat-value">{userStats.employee}</div>
                <div className="stat-change"><i className="fas fa-minus"></i> No change</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Geofences</div>
                  <div className="stat-icon geofences-icon"><i className="fas fa-map-marked-alt"></i></div>
                </div>
                <div className="stat-value">{geofences.length}</div>
                <div className="stat-change"><i className="fas fa-minus"></i> No change</div>
              </div>
            </div>
            <div className="legend">
              <h2>Legend</h2>
              <div className="legend-items">
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#3a7bd5' }}></div><div className="legend-label">Active Users</div></div>
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#5eba00' }}></div><div className="legend-label">Present Today</div></div>
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#f2b600' }}></div><div className="legend-label">Geofence Active</div></div>
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#f5576c' }}></div><div className="legend-label">Attention Needed</div></div>
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#6c757d' }}></div><div className="legend-label">Inactive</div></div>
                <div className="legend-item"><div className="color-box" style={{ backgroundColor: '#00d2ff' }}></div><div className="legend-label">New</div></div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="dashboard-card">
            <h2>Registered Users</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'geofences' && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Create New Geofence</h2>
              <form onSubmit={createGeofence} className="form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newGeofence.name}
                    onChange={(e) => setNewGeofence({...newGeofence, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newGeofence.latitude}
                      onChange={(e) => setNewGeofence({...newGeofence, latitude: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newGeofence.longitude}
                      onChange={(e) => setNewGeofence({...newGeofence, longitude: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Radius (meters)</label>
                  <input
                    type="number"
                    value={newGeofence.radius}
                    onChange={(e) => setNewGeofence({...newGeofence, radius: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newGeofence.description}
                    onChange={(e) => setNewGeofence({...newGeofence, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Geofence'}
                </button>
              </form>
            </div>

            <div className="dashboard-card">
              <h2>Existing Geofences</h2>
              <div className="geofence-list">
                {geofences.map((geofence) => (
                  <div key={geofence._id} className="geofence-item">
                    <div className="geofence-info">
                      <h4>{geofence.name}</h4>
                      <p>Lat: {geofence.center.latitude}, Lng: {geofence.center.longitude}</p>
                      <p>Radius: {geofence.radius}m</p>
                      {geofence.description && <p>{geofence.description}</p>}
                    </div>
                    <button
                      onClick={() => deleteGeofence(geofence._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="dashboard-card">
            <h2>Attendance Logs</h2>
            {/* Search */}
            <div style={{ marginBottom: 15 }}>
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search by user or location..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e5e7eb',
                }}
              />
            </div>

            {/* Grouped by Day and Location */}
            {groupedAttendance.length === 0 && (
              <div className="no-data">No records found.</div>
            )}

            {groupedAttendance.map((dayGroup) => (
              <div key={dayGroup.dayKey} style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 10, color: '#4cc9f0' }}>{dayGroup.dayLabel}</h3>
                {dayGroup.locations.map((loc) => (
                  <div key={loc.location} className="table-container" style={{ marginBottom: 20 }}>
                    <div style={{ padding: '10px 15px', color: '#e5e7eb', fontWeight: 600 }}>{loc.location}</div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Check-In</th>
                          <th>Check-Out</th>
                          <th>Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loc.users.map((u) => (
                          <tr key={u.userId}>
                            <td>{u.user}</td>
                            <td>{formatTime(u.checkIn)}</td>
                            <td>{formatTime(u.checkOut)}</td>
                            <td>
                              <span className={`status-badge ${u.classification === 'Complete' ? 'status-check-in' : 'status-check-out'}`}>
                                {u.classification}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Create Announcement</h2>
              <form onSubmit={createAnnouncement} className="form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Announcement'}
                </button>
              </form>
            </div>

            <div className="dashboard-card">
              <h2>All Announcements</h2>
              <div className="announcements-list">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="announcement-card">
                    <div className="announcement-header">
                      <h3>{announcement.title}</h3>
                      <div className="announcement-actions">
                        <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        <button
                          onClick={() => deleteAnnouncement(announcement._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="announcement-message">{announcement.message}</p>
                    <div className="announcement-footer">
                      <span className="announcement-author">By {announcement.createdBy.name}</span>
                      <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
