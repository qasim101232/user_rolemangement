const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login controller
const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    // Validate input
    if (!login_id || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Login ID and password are required' 
      });
    }

    // Find user by login_id
    const user = await User.findByLoginId(login_id);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is enabled
    if (!user.enabled) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is disabled. Please contact administrator.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Prepare user data for response (exclude password)
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      login_id: user.login_id,
      roles: user.roles || [],
      enabled: user.enabled
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id,
        login_id: user.login_id,
        roles: user.roles || []
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        login_id: user.login_id,
        roles: user.roles || [],
        enabled: user.enabled
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = { login, getCurrentUser };