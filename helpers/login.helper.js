const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.password, u.role, u.is_verified, r.role_name
     FROM users u LEFT JOIN roles r ON u.role = r.id WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (!user.is_verified) {
    const err = new Error('Account not verified. Please verify via OTP.');
    err.status = 403;
    err.user_id = user.id;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, role_name: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, role_name: user.role_name },
  };
};

module.exports = { login };
