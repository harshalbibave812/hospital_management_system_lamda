const patientService = require('../services/patient.service');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const getDashboard = async (userId) => {
  const [stats, appointmentsChart, departmentsChart] = await Promise.all([
    patientService.getDashboardStats(userId),
    patientService.getAppointmentsThisMonth(userId),
    patientService.getConsultationsByDepartment(userId),
  ]);
  return { stats, appointmentsChart, departmentsChart };
};

const getProfile = async (userId) => {
  const profile = await patientService.getProfile(userId);
  if (!profile) {
    const err = new Error('Patient profile not found');
    err.status = 404;
    throw err;
  }
  return profile;
};

const updateProfile = async (userId, data) => {
  await patientService.upsertProfile(userId, data);
  return { message: 'Profile updated successfully' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await pool.query('SELECT password FROM users WHERE id=$1', [userId]);
  if (result.rows.length === 0) {
    const err = new Error('User not found'); err.status = 404; throw err;
  }
  const match = await bcrypt.compare(currentPassword, result.rows[0].password);
  if (!match) {
    const err = new Error('Current password is incorrect'); err.status = 400; throw err;
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, userId]);
  return { message: 'Password changed successfully' };
};

const uploadPhoto = async (userId, photoUrl) => {
  await patientService.updateProfilePhoto(userId, photoUrl);
  return { message: 'Profile photo updated', photoUrl };
};

module.exports = { getDashboard, getProfile, updateProfile, changePassword, uploadPhoto };
