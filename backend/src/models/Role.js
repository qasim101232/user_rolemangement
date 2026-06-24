const { pool } = require('../config/database');

class Role {
  // Get all active roles
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM roles WHERE status = $1 ORDER BY role_id',
      ['active']
    );
    return result.rows;
  }

  // Get role by ID
  static async findById(roleId) {
    const result = await pool.query(
      'SELECT * FROM roles WHERE role_id = $1',
      [roleId]
    );
    return result.rows[0];
  }

  // Get role by name
  static async findByName(roleName) {
    const result = await pool.query(
      'SELECT * FROM roles WHERE role_name = $1',
      [roleName]
    );
    return result.rows[0];
  }

  // Create a new role
  static async create(roleData) {
    const { role_name, role_description } = roleData;
    const result = await pool.query(
      `INSERT INTO roles (role_name, role_description, status) 
       VALUES ($1, $2, 'active') 
       RETURNING *`,
      [role_name, role_description]
    );
    return result.rows[0];
  }

  // Update role status
  static async updateStatus(roleId, status) {
    await pool.query(
      'UPDATE roles SET status = $1 WHERE role_id = $2',
      [status, roleId]
    );
  }

  // Get users with a specific role
  static async getUsersByRole(roleName) {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.login_id
       FROM users u
       JOIN user_roles ur ON u.user_id = ur.user_id
       JOIN roles r ON ur.role_id = r.role_id
       WHERE r.role_name = $1 AND u.enabled = true`,
      [roleName]
    );
    return result.rows;
  }
}

module.exports = Role;