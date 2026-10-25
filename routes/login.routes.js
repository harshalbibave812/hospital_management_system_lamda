const express = require('express');
const router = express.Router();
const loginHelper = require('../helpers/login.helper');

router.post('/login', async (req, res) => {
  try {
    const result = await loginHelper.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    if (err.user_id) {
      return res.status(err.status).json({ message: err.message, user_id: err.user_id });
    }
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
