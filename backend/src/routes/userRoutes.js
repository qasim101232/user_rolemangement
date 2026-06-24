const express = require('express');
const { 
  getAllUsers, 
  createUser, 
  getAllRoles,
  updateUserStatus,
  deleteUser
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public route: roles (allow login page to fetch available roles)
router.get('/roles', getAllRoles);

// All routes below require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', authorizeRoles('admin'), getAllUsers);
router.post('/', authorizeRoles('admin'), createUser);
router.put('/:userId/status', authorizeRoles('admin'), updateUserStatus);
router.delete('/:userId', authorizeRoles('admin'), deleteUser);

module.exports = router;