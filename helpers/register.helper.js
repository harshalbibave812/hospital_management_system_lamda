const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailOtp, sendSmsOtp } = require('../config/otp.service');

// In-memory OTP store: { user_id: { otp, expires } }
const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (name, email, phone, password, role_id) => {
  const roleIdInt = parseInt(role_id, 10);
  if (isNaN(roleIdInt)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const roleCheck = await pool.query('SELECT id FROM roles WHERE id = $1', [roleIdInt]);
  if (roleCheck.rows.length === 0) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, false) RETURNING id, name, email, role`,
    [name, email, phone, hashed, roleIdInt]
  );

  return { message: 'Registration successful. Please verify your account.', user: result.rows[0] };
};

const sendOtp = async (user_id, method) => {
  const result = await pool.query('SELECT email, phone FROM users WHERE id = $1', [user_id]);
  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const { email, phone } = result.rows[0];
  const otp = generateOtp();
  otpStore[user_id] = { otp, expires: Date.now() + 10 * 60 * 1000 };

  if (method === 'email') {
    await sendEmailOtp(email, otp);
    return { message: `OTP sent to email ${email}` };
  } else {
    await sendSmsOtp(phone, otp);
    return { message: `OTP sent to phone ${phone}` };
  }
};

const verifyOtp = async (user_id, otp) => {
  const stored = otpStore[user_id];
  if (!stored) {
    const err = new Error('OTP not found. Please request a new one.');
    err.status = 400;
    throw err;
  }
  if (Date.now() > stored.expires) {
    delete otpStore[user_id];
    const err = new Error('OTP expired. Please request a new one.');
    err.status = 400;
    throw err;
  }
  if (stored.otp !== otp) {
    const err = new Error('Invalid OTP');
    err.status = 400;
    throw err;
  }

  delete otpStore[user_id];
  await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [user_id]);

  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, r.role_name
     FROM users u LEFT JOIN roles r ON u.role = r.id WHERE u.id = $1`,
    [user_id]
  );
  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.id, role: user.role, role_name: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    message: 'OTP verified successfully',
    token,
    user: { id: user.id, name: user.name, email: user.email, role_name: user.role_name },
  };
};

const getRoles = async () => {
  const result = await pool.query('SELECT id, role_name FROM roles ORDER BY id');
  return { roles: result.rows };
};

module.exports = { register, sendOtp, verifyOtp, getRoles };
