const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Usage:
// node src/utils/resetAdminPassword.js "newPassword"
// Default: admin123

(async () => {
  try {
    const newPassword = process.argv[2] || 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const r = await pool.query(
      `UPDATE users
       SET password = $1, enabled = true, updated_at = CURRENT_TIMESTAMP
       WHERE login_id = $2
       RETURNING user_id, login_id, enabled`,
      [passwordHash, 'admin']
    );

    if (r.rows.length === 0) {
      console.log('No user found with login_id="admin". Run init-db first.');
      process.exitCode = 1;
      return;
    }

    console.log('✅ Admin password updated.');
    console.log('login_id: admin');
    console.log('newPassword:', newPassword);
    console.log('enabled:', r.rows[0].enabled);
  } catch (e) {
    console.error('❌ Failed to reset admin password:', e);
    process.exitCode = 1;
  } finally {
    // Ensure pool closes
    try {
      await pool.end();
    } catch {
      // ignore
    }
  }
})();

