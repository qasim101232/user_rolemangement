import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Settings.css';

const Settings = ({ onBack }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    publicProfile: false,
    activityLog: true,
    dataRetention: '90'
  });
  const [message, setMessage] = useState('');

  const handleSettingChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }));
    setMessage('✅ Setting updated');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error saving settings');
    }
  };

  return (
    <div className="settings-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h1>⚙️ Settings</h1>

      {message && <div className="success-message">{message}</div>}

      <div className="settings-grid">
        {/* Theme Settings */}
        <div className="settings-section">
          <h2>🎨 Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Dark Mode</h3>
              <p>Switch between light and dark theme</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Current Theme</h3>
              <p>{isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2>🔔 Notifications</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>In-App Notifications</h3>
              <p>Receive notifications in the application</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.notifications}
                onChange={() => handleSettingChange('notifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Email Alerts</h3>
              <p>Receive important alerts via email</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailAlerts}
                onChange={() => handleSettingChange('emailAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <h2>🔐 Security</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.twoFactor}
                onChange={() => handleSettingChange('twoFactor')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Activity Logging</h3>
              <p>Log all account activities</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.activityLog}
                onChange={() => handleSettingChange('activityLog')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <h2>👁️ Privacy</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Public Profile</h3>
              <p>Allow others to view your profile</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.publicProfile}
                onChange={() => handleSettingChange('publicProfile')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Data Retention</h3>
              <p>How long to keep your activity logs</p>
            </div>
            <select 
              value={settings.dataRetention}
              onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
              className="retention-select"
            >
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="180">6 Months</option>
              <option value="365">1 Year</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger">
          <h2>⚠️ Danger Zone</h2>
          
          <div className="danger-action">
            <div className="action-info">
              <h3>Logout from All Devices</h3>
              <p>Logout your account from all active sessions</p>
            </div>
            <button className="btn-danger">Logout All</button>
          </div>

          <div className="danger-action">
            <div className="action-info">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSaveSettings}>
          💾 Save All Settings
        </button>
        <button className="btn-secondary" onClick={onBack}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Settings;
