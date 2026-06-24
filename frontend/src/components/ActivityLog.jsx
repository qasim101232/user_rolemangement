import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/ActivityLog.css';

const ActivityLog = ({ onBack }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/activity-log');
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Mock data if API fails
      setActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  const mockActivities = [
    { id: 1, type: 'login', user: 'Admin User', action: 'Logged in', timestamp: new Date(), ip: '192.168.1.100' },
    { id: 2, type: 'user_created', user: 'Admin User', action: 'Created new user: john.doe', timestamp: new Date(Date.now() - 3600000), ip: '192.168.1.100' },
    { id: 3, type: 'role_assigned', user: 'Admin User', action: 'Assigned manager role to user', timestamp: new Date(Date.now() - 7200000), ip: '192.168.1.100' },
    { id: 4, type: 'user_disabled', user: 'Admin User', action: 'Disabled user account', timestamp: new Date(Date.now() - 10800000), ip: '192.168.1.100' },
    { id: 5, type: 'password_changed', user: 'Manager User', action: 'Changed password', timestamp: new Date(Date.now() - 14400000), ip: '192.168.1.101' },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      login: '🔓',
      logout: '🔒',
      user_created: '➕',
      user_deleted: '🗑️',
      role_assigned: '🎭',
      password_changed: '🔑',
      profile_updated: '📝',
      settings_changed: '⚙️',
      user_disabled: '⛔',
      user_enabled: '✅'
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      login: 'success',
      logout: 'warning',
      user_created: 'info',
      user_deleted: 'danger',
      role_assigned: 'primary',
      password_changed: 'warning',
      profile_updated: 'info',
      settings_changed: 'primary',
      user_disabled: 'danger',
      user_enabled: 'success'
    };
    return colors[type] || 'default';
  };

  const filteredActivities = activities
    .filter(a => filter === 'all' || a.type === filter)
    .filter(a => 
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="activity-log-container">
        <div className="loading-spinner">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>

      <div className="activity-header">
        <h1>📋 Activity Log</h1>
        <p>View all system and user activities</p>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Activities</option>
          <option value="login">🔓 Login</option>
          <option value="logout">🔒 Logout</option>
          <option value="user_created">➕ User Created</option>
          <option value="user_deleted">🗑️ User Deleted</option>
          <option value="role_assigned">🎭 Role Assigned</option>
          <option value="password_changed">🔑 Password Changed</option>
          <option value="settings_changed">⚙️ Settings Changed</option>
          <option value="user_disabled">⛔ User Disabled</option>
        </select>
      </div>

      {/* Activity List */}
      <div className="activity-log-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities found</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className={`activity-log-item ${getActivityColor(activity.type)}`}>
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-details">
                <div className="activity-header-row">
                  <h4>{activity.action}</h4>
                  <span className={`activity-type ${activity.type}`}>
                    {activity.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="activity-meta">
                  <span className="activity-user">👤 {activity.user}</span>
                  <span className="activity-time">
                    ⏰ {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  <span className="activity-ip">🌐 {activity.ip || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="activity-stats">
        <div className="stat-box">
          <span className="stat-label">Total Activities</span>
          <span className="stat-value">{activities.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Today</span>
          <span className="stat-value">
            {activities.filter(a => {
              const today = new Date();
              const actDate = new Date(a.timestamp);
              return actDate.toDateString() === today.toDateString();
            }).length}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">This Week</span>
          <span className="stat-value">
            {activities.filter(a => {
              const now = new Date();
              const actDate = new Date(a.timestamp);
              const diffTime = Math.abs(now - actDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7;
            }).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
