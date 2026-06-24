import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Profile.css';

const Profile = ({ user, onBack }) => {
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.put('/users/profile', {
        name: profile.name,
        email: profile.email
      });
      
      if (response.data.success) {
        setProfile(response.data.user);
        setIsEditing(false);
        setMessage('✅ Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      if (response.data.success) {
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setMessage('✅ Password changed successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      
      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {profile?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="profile-info">
              <h2>{profile?.name}</h2>
              <p className="profile-email">{profile?.email}</p>
              <div className="profile-roles">
                {profile?.roles?.map(role => (
                  <span key={role} className={`role-badge ${role}`}>
                    {role === 'admin' && '👑'} {role === 'manager' && '📊'} {role === 'member' && '👤'} {role === 'user' && '🙋'} {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">Login ID</span>
              <span className="stat-value">{profile?.login_id}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Account Status</span>
              <span className="stat-value">
                {profile?.enabled ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Edit Profile */}
        <div className="profile-form-card">
          <div className="card-header">
            <h3>📝 Edit Profile</h3>
            {!isEditing && (
              <button 
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setProfile(user);
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <p><strong>Name:</strong> {profile?.name}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="profile-form-card">
          <h3>🔑 Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="Enter new password"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Session Info */}
        <div className="profile-form-card">
          <h3>📱 Active Sessions</h3>
          <div className="session-info">
            <div className="session-item">
              <span className="session-device">💻 Current Browser</span>
              <span className="session-time">Last active: Just now</span>
              <button className="btn-danger-small">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
