import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ user, onLogout, onNavigate, currentPage }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      manager: '#f59e0b',
      member: '#3b82f6',
      user: '#10b981'
    };
    return colors[role] || '#6b7280';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      manager: '📊',
      member: '👤',
      user: '🙋'
    };
    return icons[role] || '🔐';
  };

  const notifications = [
    { id: 1, message: 'System backup completed', time: '2 hours ago', type: 'success' },
    { id: 2, message: 'New user registration', time: '30 minutes ago', type: 'info' },
    { id: 3, message: 'Role permissions updated', time: '1 hour ago', type: 'info' }
  ];

  return (
    <header className="header-advanced">
      <div className="header-top">
        {/* Left Section - Logo & Company */}
        <div className="header-left-advanced">
          <div className="logo-advanced">
            <div className="logo-icon-wrapper">
              <span className="logo-icon">🔐</span>
            </div>
            <div className="logo-text-wrapper">
              <h1 className="logo-text">Auth Pro</h1>
              <p className="logo-subtitle">Role-Based Access System</p>
            </div>
          </div>
        </div>

        {/* Middle Section - Search & Info */}
        <div className="header-middle-advanced">
          <div className="breadcrumb-navigation">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Users & Roles</span>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="header-right-advanced">
          {user ? (
            <>
              {/* Notifications */}
              <div className="header-notifications">
                <button 
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <span className="notification-icon">🔔</span>
                  <span className="notification-badge">3</span>
                </button>
                
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h4>Notifications</h4>
                      <button className="notifications-close" onClick={() => setShowNotifications(false)}>✕</button>
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.type}`}>
                          <div className="notification-content">
                            <p className="notification-message">{notif.message}</p>
                            <span className="notification-time">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="notifications-footer">
                      <button className="view-all-btn">View All Notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="user-profile-advanced">
                <button 
                  className="user-profile-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div 
                    className="avatar-advanced"
                    style={{ 
                      background: user.roles && user.roles.length > 0 
                        ? getRoleColor(user.roles[0]) 
                        : '#6b7280'
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="user-info-compact">
                    <span className="user-name-compact">{user.name}</span>
                    <span className="user-role-compact">
                      {user.roles && user.roles[0] ? `${getRoleIcon(user.roles[0])} ${user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)}` : 'User'}
                    </span>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div 
                        className="avatar-large"
                        style={{ 
                          background: user.roles && user.roles.length > 0 
                            ? getRoleColor(user.roles[0]) 
                            : '#6b7280'
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="user-menu-info">
                        <h4 className="menu-user-name">{user.name}</h4>
                        <p className="menu-user-email">{user.email || 'user@system.com'}</p>
                      </div>
                    </div>

                    <div className="user-roles-display">
                      <span className="roles-label">Roles:</span>
                      <div className="roles-list">
                        {user.roles && user.roles.map(role => (
                          <span key={role} className={`role-badge-menu ${role}`}>
                            {getRoleIcon(role)} {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="menu-separator"></div>

                    <div className="menu-items">
                      <button className="menu-item" onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}>
                        <span className="menu-icon">👤</span>
                        <span>My Profile</span>
                      </button>
                      <button className="menu-item" onClick={() => {
                        onNavigate('activity');
                        setShowUserMenu(false);
                      }}>
                        <span className="menu-icon">📋</span>
                        <span>Activity Log</span>
                      </button>
                      <button className="menu-item" onClick={() => {
                        onNavigate('settings');
                        setShowUserMenu(false);
                      }}>
                        <span className="menu-icon">⚙️</span>
                        <span>Settings</span>
                      </button>
                      <button className="menu-item" onClick={toggleTheme}>
                        <span className="menu-icon">{isDarkMode ? '☀️' : '🌙'}</span>
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <button className="menu-item">
                        <span className="menu-icon">❓</span>
                        <span>Help & Support</span>
                      </button>
                    </div>

                    <div className="menu-separator"></div>

                    <button className="menu-item logout" onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}>
                      <span className="menu-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="guest-text">Guest</span>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="header-status-bar">
        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className="status-value active">🟢 Online</span>
        </div>
        <div className="status-item">
          <span className="status-label">Last Login:</span>
          <span className="status-value">Today at 09:30 AM</span>
        </div>
        <div className="status-item">
          <span className="status-label">Session:</span>
          <span className="status-value">Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;