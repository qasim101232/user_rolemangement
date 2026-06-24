const { pool } = require('../config/database');

class User {
  // Find user by login_id with their roles
  static async findByLoginId(loginId) {
    const result = await pool.query(
      `SELECT u.*, 
              array_agg(r.role_name) as roles,
              array_agg(r.role_id) as role_ids
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.login_id = $1
       GROUP BY u.user_id`,
      [loginId]
    );
    return result.rows[0];
  }

  // Find user by ID with their roles
  static async findById(userId) {
    const result = await pool.query(
      `SELECT u.*, 
              array_agg(r.role_name) as roles,
              array_agg(r.role_id) as role_ids
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.user_id = $1
       GROUP BY u.user_id`,
      [userId]
    );
    return result.rows[0];
  }

  // Get all users with their roles
  static async findAll() {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.login_id, u.enabled,
              u.created_at, u.updated_at,
              array_agg(r.role_name) as roles,
              array_agg(r.role_id) as role_ids
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       GROUP BY u.user_id
       ORDER BY u.user_id`
    );
    return result.rows;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, login_id, password } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, login_id, password, enabled) 
       VALUES ($1, $2, $3, $4, true) 
       RETURNING user_id, name, email, login_id, enabled`,
      [name, email, login_id, password]
    );
    return result.rows[0];
  }

  // Assign a role to a user
  static async assignRole(userId, roleId) {
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleId]
    );
  }

  // Update user status (enable/disable)
  static async updateStatus(userId, enabled) {
    await pool.query(
      `UPDATE users 
       SET enabled = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2`,
      [enabled, userId]
    );
  }

  // Check if user has a specific role
  static async hasRole(userId, roleName) {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = $1 AND r.role_name = $2
      )`,
      [userId, roleName]
    );
    return result.rows[0].exists;
  }
}

module.exports = User;