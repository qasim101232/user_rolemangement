const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      delete user.password;
      return user;
    });

    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, login_id, password, role_id } = req.body;

    // Validate input
    if (!name || !email || !login_id || !password || !role_id) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required: name, email, login_id, password, role_id' 
      });
    }

    // Check if role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      login_id,
      password: hashedPassword
    });

    // Assign role
    await User.assignRole(newUser.user_id, role_id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        login_id: newUser.login_id,
        role: role.role_name,
        enabled: newUser.enabled
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false,
        message: 'Email or Login ID already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json({
      success: true,
      roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Update user status (enable/disable)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Enabled status is required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Cannot disable yourself
    if (userId == req.user.user_id && !enabled) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot disable your own account' 
      });
    }

    await User.updateStatus(userId, enabled);

    res.json({
      success: true,
      message: `User ${enabled ? 'enabled' : 'disabled'} successfully`,
      user_id: userId,
      enabled: enabled
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Cannot delete yourself
    if (userId == req.user.user_id) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot delete your own account' 
      });
    }

    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = { 
  getAllUsers, 
  createUser, 
  getAllRoles,
  updateUserStatus,
  deleteUser 
};