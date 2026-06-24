import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SearchableDropdown from './SearchableDropdown';

const Dashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    login_id: '',
    password: '',
    role_id: ''
  });
  const [formError, setFormError] = useState('');

  const isAdmin = (user?.roles || []).includes('admin');
  const isManager = (user?.roles || []).includes('manager') || isAdmin;

  // Mock recent activities for demo
  const recentActivities = [
    { id: 1, action: 'User created', target: 'john.doe@example.com', time: '2 hours ago', icon: '➕' },
    { id: 2, action: 'Role assigned', target: 'admin role', time: '5 hours ago', icon: '🎭' },
    { id: 3, action: 'User disabled', target: 'jane.smith@example.com', time: '1 day ago', icon: '⛔' },
    { id: 4, action: 'Password reset', target: 'robert.wilson@example.com', time: '2 days ago', icon: '🔑' },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // roles are allowed for any authenticated user
      const rolesRes = await api.get('/users/roles');
      setRoles(rolesRes.data.roles || []);

      // users list is admin-only
      if ((user?.roles || []).includes('admin')) {
        try {
          const usersRes = await api.get('/users');
          setUsers(usersRes.data.users || []);
        } catch (err) {
          console.error('Error fetching users:', err);
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await api.post('/users', newUser);
      setShowForm(false);
      setNewUser({ name: '', email: '', login_id: '', password: '', role_id: '' });
      fetchData(); // Refresh user list
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleInputChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value) => {
    setNewUser({
      ...newUser,
      role_id: value
    });
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) {
      return <span className="role-badge user">No Role</span>;
    }
    return roles.map(role => (
      <span key={role} className={`role-badge ${role}`}>
        {role}
      </span>
    ));
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.login_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !filterRole || (u.roles && u.roles.includes(filterRole));
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.enabled) ||
      (filterStatus === 'inactive' && !u.enabled);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      manager: '📊',
      member: '👤',
      user: '🙋'
    };
    return icons[role] || '🔐';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header-advanced">
        <div className="header-content">
          <h2>Dashboard</h2>
          <p className="dashboard-subtitle">Overview & User Management</p>
        </div>
        <div className="user-info-section">
          <span className="info-label">Logged in as:</span>
          <span className="info-value">{user?.name}</span>
          <div className="user-roles-badges">
            {user?.roles?.map(role => (
              <span key={role} className="role-badge-small-inline">
                {getRoleIcon(role)} {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        {isAdmin && (
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            📈 Activity
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid-advanced">
            <div className="stat-card-advanced">
              <div className="stat-header">
                <span className="stat-icon-large">👥</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{users.length}</h3>
                <p className="stat-change positive">↑ 12% from last month</p>
              </div>
            </div>

            <div className="stat-card-advanced">
              <div className="stat-header">
                <span className="stat-icon-large">✅</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{users.filter(u => u.enabled).length}</h3>
                <p className="stat-change positive">↑ {Math.round((users.filter(u => u.enabled).length / users.length) * 100)}% Active</p>
              </div>
            </div>

            <div className="stat-card-advanced">
              <div className="stat-header">
                <span className="stat-icon-large">🎭</span>
                <span className="stat-label">Total Roles</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{roles.length}</h3>
                <p className="stat-change">{roles.length} role assignments</p>
              </div>
            </div>

            <div className="stat-card-advanced">
              <div className="stat-header">
                <span className="stat-icon-large">⛔</span>
                <span className="stat-label">Inactive Users</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{users.filter(u => !u.enabled).length}</h3>
                <p className="stat-change negative">Disabled accounts</p>
              </div>
            </div>
          </div>

          {/* Activity & Roles Section */}
          <div className="dashboard-grid">
            {/* Recent Activity */}
            <div className="activity-card">
              <h3 className="section-title">📋 Recent Activity</h3>
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <span className="activity-icon">{activity.icon}</span>
                    <div className="activity-content">
                      <p className="activity-text">{activity.action}</p>
                      <span className="activity-target">{activity.target}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
              <button className="view-more-btn">View All Activities</button>
            </div>

            {/* Roles Overview */}
            <div className="roles-card">
              <h3 className="section-title">🔐 Roles Overview</h3>
              <div className="roles-list-advanced">
                {roles.length === 0 ? (
                  <p className="no-data">No roles available</p>
                ) : (
                  roles.map(role => (
                    <div key={role.role_id} className="role-item-advanced">
                      <div className="role-info">
                        <span className="role-name">{role.role_name}</span>
                        <span className="role-users-count">
                          {users.filter(u => u.roles?.includes(role.role_name)).length} users
                        </span>
                      </div>
                      <div className="role-progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${Math.min((users.filter(u => u.roles?.includes(role.role_name)).length / users.length) * 100 || 0, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Search & Filters */}
          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users by name, email, or login ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-group">
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {isAdmin && (
                <button 
                  className="btn-add-user-advanced"
                  onClick={() => {
                    setShowForm(!showForm);
                    setFormError('');
                  }}
                >
                  {showForm ? '✕ Cancel' : '+ Add User'}
                </button>
              )}
            </div>
          </div>

          {/* Add User Form */}
          {showForm && isAdmin && (
            <form className="user-form-advanced" onSubmit={handleCreateUser}>
              <h4>🆕 Create New User</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Login ID *</label>
                  <input
                    type="text"
                    name="login_id"
                    value={newUser.login_id}
                    onChange={handleInputChange}
                    placeholder="Enter unique login ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (min 6 chars)"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <SearchableDropdown
                options={roles.map(role => ({
                  value: role.role_id,
                  label: role.role_name
                }))}
                value={newUser.role_id}
                onChange={handleRoleChange}
                label="Select Role"
                placeholder="Choose a role..."
                required
                error={formError}
              />

              {formError && <div className="form-error">{formError}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Create User
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="table-container-advanced">
            <div className="table-header-advanced">
              <h3>👥 User List</h3>
              <span className="users-count">{filteredUsers.length} of {users.length} users</span>
            </div>

            <div className="table-wrapper">
              {filteredUsers.length === 0 ? (
                <div className="empty-state">
                  {users.length === 0 ? (
                    <p>📭 No users found. {isAdmin && 'Create one to get started!'}</p>
                  ) : (
                    <p>🔍 No users match your search criteria</p>
                  )}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Login ID</th>
                      <th>Roles</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, index) => (
                      <tr key={u.user_id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small" style={{ background: u.roles?.[0] ? '#dbeafe' : '#e5e7eb' }}>
                              {u.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="user-name-cell">{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <code className="login-id">{u.login_id}</code>
                        </td>
                        <td>{getRoleBadge(u.roles)}</td>
                        <td>
                          <span className={`status-badge ${u.enabled ? 'active' : 'inactive'}`}>
                            {u.enabled ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && isAdmin && (
        <div className="activity-section">
          <h3 className="section-title">📈 System Activity Log</h3>
          <div className="activity-log">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-log-item">
                <div className="activity-log-icon">{activity.icon}</div>
                <div className="activity-log-content">
                  <p className="activity-log-action">{activity.action}</p>
                  <p className="activity-log-detail">Target: {activity.target}</p>
                </div>
                <span className="activity-log-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;