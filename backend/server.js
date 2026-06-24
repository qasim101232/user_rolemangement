const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { testConnection } = require('./src/config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// ===== ROOT ROUTE - Fix for "Cannot GET /" =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Role-Based Authentication API is running!',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me (requires token)'
      },
      users: {
        list: 'GET /api/users (admin only)',
        create: 'POST /api/users (admin only)',
        roles: 'GET /api/users/roles',
        status: 'PUT /api/users/:userId/status (admin only)',
        delete: 'DELETE /api/users/:userId (admin only)'
      },
      health: 'GET /api/health'
    },
    default_login: {
      login_id: 'admin',
      password: 'admin123'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 Handler for undefined routes =====
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    requested_url: req.originalUrl,
    available_routes: {
      root: 'GET /',
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      users: 'GET /api/users',
      create_user: 'POST /api/users',
      roles: 'GET /api/users/roles'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Root: http://localhost:${PORT}`);
  console.log(`🔑 Default login: admin / admin123`);
});