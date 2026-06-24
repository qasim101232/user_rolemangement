const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Usage:
// node src/utils/resetDefaultPasswords.js <password>
// Example: node src/utils/resetDefaultPasswords.js admin123

(async () => {
  const newPassword = process.argv[2] || 'admin123';
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const ids = ['admin', 'manager', 'member', 'user', 'teamlead', 'superadmin'];

  try {
    const r = await pool.query(
      `UPDATE users
       SET password = $1,
           enabled = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE login_id = ANY($2::text[])
       RETURNING login_id`,
      [passwordHash, ids]
    );

    console.log('✅ Password reset for:', r.rows.map(x => x.login_id));
    console.log('login_ids:', ids.join(', '));
    console.log('newPassword:', newPassword);
  } catch (e) {
    console.error('❌ Reset failed:', e);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch {}
  }
})();

