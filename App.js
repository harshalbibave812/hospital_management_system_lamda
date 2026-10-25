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

// ── Route-level global middleware (applied once per route group) ───────────────
// Login routes: rate limit + body validation applied globally before the router
app.use('/api/auth/login', authLimiter, validateBody('login'));

// Register routes: rate limit + body validation per endpoint
app.use('/api/auth/register', authLimiter, validateBody('register'));
app.use('/api/auth/send-otp', otpLimiter, validateBody('sendOtp'));
app.use('/api/auth/verify-otp', otpLimiter, validateBody('verifyOtp'));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/login.routes'));
app.use('/api/auth', require('./routes/register.routes'));

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
