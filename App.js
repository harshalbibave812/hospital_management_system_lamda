require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { authLimiter, otpLimiter } = require('./middlewares/rateLimiter.middleware');
const { validateBody } = require('./middlewares/validation.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

// ── Request / Response Logger ──────────────────────────────────────────────────
app.use((req, res, next) => {
  if (Object.keys(req.body).length) console.log('[REQ PAYLOAD]', req.method, req.url, req.body);
  const originalJson = res.json.bind(res);
  res.json = (data) => { console.log('[RES PAYLOAD]', req.method, req.url, data); return originalJson(data); };
  next();
});

// ── Auth route-level middleware ────────────────────────────────────────────────
app.use('/api/auth/login',      authLimiter, validateBody('login'));
app.use('/api/auth/register',   authLimiter, validateBody('register'));
app.use('/api/auth/send-otp',   otpLimiter,  validateBody('sendOtp'));
app.use('/api/auth/verify-otp', otpLimiter,  validateBody('verifyOtp'));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/login.routes'));
app.use('/api/auth',    require('./routes/register.routes'));
app.use('/api/patient', require('./routes/patient.routes'));

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
