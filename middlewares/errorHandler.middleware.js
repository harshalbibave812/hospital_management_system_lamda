const errorHandler = (err, req, res, next) => {
  // express-joi-validation errors
  if (err && err.error && err.error.isJoi) {
    const messages = err.error.details.map((d) => d.message);
    console.error(`[VALIDATION ERROR] ${req.method} ${req.originalUrl} →`, messages);
    return res.status(422).json({ message: 'Validation failed', errors: messages });
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
