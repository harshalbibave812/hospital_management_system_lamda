const Joi = require('joi');
const { createValidator } = require('express-joi-validation');

const validator = createValidator({ passError: true });

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    password: Joi.string().min(6).required(),
    role_id: Joi.number().integer().required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  sendOtp: Joi.object({
    user_id: Joi.number().integer().required(),
    method: Joi.string().valid('email', 'phone').required(),
  }),

  verifyOtp: Joi.object({
    user_id: Joi.number().integer().required(),
    otp: Joi.string().length(6).required(),
  }),
};

// Returns a middleware array: [validator.body(schema)]
const validateBody = (schemaKey) => [validator.body(schemas[schemaKey])];

module.exports = { validateBody };
