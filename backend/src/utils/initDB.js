const { pool, testConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  try {
    // First test the connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot proceed with database initialization');
      process.exit(1);
    }

    console.log('📦 Starting database initialization...');

    // 1. Roles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        role_description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Roles table created');

    // 2. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        login_id VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // 3. User_Roles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_role_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role_id)
      )
    `);
    console.log('✅ User_Roles table created');

    // Insert default roles
    console.log('📝 Inserting default roles...');
    await pool.query(`
      INSERT INTO roles (role_name, role_description, status) 
      VALUES 
        ('admin', 'System Administrator with full access', 'active'),
        ('manager', 'Manager with team management access', 'active'),
        ('member', 'Regular team member', 'active'),
        ('user', 'Normal user with basic access', 'active')
      ON CONFLICT (role_name) DO NOTHING
    `);
    console.log('✅ Default roles inserted');

    // Insert default admin user
    console.log('📝 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await pool.query(`
      INSERT INTO users (name, email, login_id, password, enabled) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (login_id) DO NOTHING
      RETURNING user_id
    `, ['Admin User', 'admin@example.com', 'admin', hashedPassword, true]);

    if (adminUser.rows.length > 0) {
      // Assign admin role
      await pool.query(`
        INSERT INTO user_roles (user_id, role_id) 
        VALUES ($1, (SELECT role_id FROM roles WHERE role_name = 'admin'))
      `, [adminUser.rows[0].user_id]);
      console.log('✅ Default admin user created');
      console.log('   Login ID: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    console.log('🎉 Database initialized successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
    
    // Check if it's a connection error
    if (error.message.includes('password')) {
      console.log('\n🔧 FIX: Please check your .env file:');
      console.log('  1. Make sure DB_PASSWORD is set correctly');
      console.log('  2. Remove any quotes around the password');
      console.log('  3. Check if PostgreSQL is running');
      console.log('  4. Verify the password is correct');
    }
  } finally {
    await pool.end();
  }
};

// Run the initialization
createTables();