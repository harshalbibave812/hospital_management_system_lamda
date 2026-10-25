const express = require('express');
const router = express.Router();
const registerHelper = require('../helpers/register.helper');

router.get('/roles', async (req, res) => {
  try {
    const result = await registerHelper.getRoles();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role_id } = req.body;
    const result = await registerHelper.register(name, email, phone, password, role_id);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const result = await registerHelper.sendOtp(req.body.user_id, req.body.method);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const result = await registerHelper.verifyOtp(req.body.user_id, req.body.otp);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
