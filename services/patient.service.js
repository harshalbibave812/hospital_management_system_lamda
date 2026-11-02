const pool = require('../config/db');

// ── Dashboard ─────────────────────────────────────────────────────────────────

const getDashboardStats = async (userId) => {
  const [upcoming, completed, prescriptions, reports, payments] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM appointments WHERE patient_id=$1 AND status='Upcoming'`, [userId]),
    pool.query(`SELECT COUNT(*) FROM appointments WHERE patient_id=$1 AND status='Completed'`, [userId]),
    pool.query(`SELECT COUNT(*) FROM prescriptions WHERE patient_id=$1`, [userId]),
    pool.query(`SELECT COUNT(*) FROM medical_reports WHERE patient_id=$1`, [userId]),
    pool.query(`SELECT COUNT(*) FROM payments WHERE patient_id=$1 AND status='Pending'`, [userId]),
  ]);

  return {
    upcomingAppointments: parseInt(upcoming.rows[0].count),
    completedAppointments: parseInt(completed.rows[0].count),
    prescriptions: parseInt(prescriptions.rows[0].count),
    medicalReports: parseInt(reports.rows[0].count),
    pendingPayments: parseInt(payments.rows[0].count),
  };
};

const getAppointmentsThisMonth = async (userId) => {
  const result = await pool.query(
    `SELECT TO_CHAR(appointment_date,'Mon DD') AS day, COUNT(*) AS count
     FROM appointments
     WHERE patient_id=$1
       AND DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE)
     GROUP BY appointment_date ORDER BY appointment_date`,
    [userId]
  );
  return result.rows;
};

const getConsultationsByDepartment = async (userId) => {
  const result = await pool.query(
    `SELECT d.name AS department, COUNT(a.id) AS count
     FROM appointments a
     JOIN departments d ON a.department_id = d.id
     WHERE a.patient_id=$1
     GROUP BY d.name ORDER BY count DESC`,
    [userId]
  );
  return result.rows;
};

// ── Profile ───────────────────────────────────────────────────────────────────

const getProfile = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone,
            p.date_of_birth, p.gender, p.blood_group,
            p.address_line1, p.address_line2, p.city, p.state, p.pincode, p.country,
            p.emergency_name, p.emergency_relation, p.emergency_phone,
            p.insurance_provider, p.insurance_policy_no, p.insurance_expiry,
            p.profile_photo_url
     FROM users u
     LEFT JOIN patient_profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const upsertProfile = async (userId, data) => {
  const {
    name, phone,
    date_of_birth, gender, blood_group,
    address_line1, address_line2, city, state, pincode, country,
    emergency_name, emergency_relation, emergency_phone,
    insurance_provider, insurance_policy_no, insurance_expiry,
  } = data;

  await pool.query(`UPDATE users SET name=$1, phone=$2 WHERE id=$3`, [name, phone, userId]);

  await pool.query(
    `INSERT INTO patient_profiles
       (user_id, date_of_birth, gender, blood_group,
        address_line1, address_line2, city, state, pincode, country,
        emergency_name, emergency_relation, emergency_phone,
        insurance_provider, insurance_policy_no, insurance_expiry, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       date_of_birth=$2, gender=$3, blood_group=$4,
       address_line1=$5, address_line2=$6, city=$7, state=$8, pincode=$9, country=$10,
       emergency_name=$11, emergency_relation=$12, emergency_phone=$13,
       insurance_provider=$14, insurance_policy_no=$15, insurance_expiry=$16,
       updated_at=NOW()`,
    [userId, date_of_birth || null, gender, blood_group,
     address_line1, address_line2, city, state, pincode, country,
     emergency_name, emergency_relation, emergency_phone,
     insurance_provider, insurance_policy_no, insurance_expiry || null]
  );
};

const updateProfilePhoto = async (userId, photoUrl) => {
  await pool.query(
    `INSERT INTO patient_profiles (user_id, profile_photo_url, updated_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (user_id) DO UPDATE SET profile_photo_url=$2, updated_at=NOW()`,
    [userId, photoUrl]
  );
};

module.exports = {
  getDashboardStats,
  getAppointmentsThisMonth,
  getConsultationsByDepartment,
  getProfile,
  upsertProfile,
  updateProfilePhoto,
};
