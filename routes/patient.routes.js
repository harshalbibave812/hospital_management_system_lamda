const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const patientHelper = require('../helpers/patient.helper');

// All patient routes require auth + Patient role
router.use(verifyToken, authorizeRole('Patient'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const data = await patientHelper.getDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const profile = await patientHelper.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.put('/profile', validateBody('updateProfile'), async (req, res) => {
  try {
    const result = await patientHelper.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.put('/profile/password', validateBody('changePassword'), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const result = await patientHelper.changePassword(req.user.id, current_password, new_password);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.put('/profile/photo', validateBody('uploadPhoto'), async (req, res) => {
  try {
    const result = await patientHelper.uploadPhoto(req.user.id, req.body.photo_url);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
