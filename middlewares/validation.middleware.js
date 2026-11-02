const Joi = require('joi');
const { createValidator } = require('express-joi-validation');

const validator = createValidator({ passError: true });

const phone = Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required();

const schemas = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  register: Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    phone,
    password: Joi.string().min(6).required(),
    role_id:  Joi.number().integer().required(),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  sendOtp: Joi.object({
    user_id: Joi.number().integer().required(),
    method:  Joi.string().valid('email', 'phone').required(),
  }),

  verifyOtp: Joi.object({
    user_id: Joi.number().integer().required(),
    otp:     Joi.string().length(6).required(),
  }),

  // ── Patient ───────────────────────────────────────────────────────────────
  updateProfile: Joi.object({
    name:                  Joi.string().min(2).max(100).required(),
    phone,
    date_of_birth:         Joi.date().iso().max('now').optional().allow('', null),
    gender:                Joi.string().valid('Male', 'Female', 'Other').optional().allow('', null),
    blood_group:           Joi.string().valid('A+','A-','B+','B-','AB+','AB-','O+','O-').optional().allow('', null),
    address_line1:         Joi.string().max(200).optional().allow('', null),
    address_line2:         Joi.string().max(200).optional().allow('', null),
    city:                  Joi.string().max(100).optional().allow('', null),
    state:                 Joi.string().max(100).optional().allow('', null),
    pincode:               Joi.string().pattern(/^\d{4,10}$/).optional().allow('', null),
    country:               Joi.string().max(100).optional().allow('', null),
    emergency_name:        Joi.string().max(100).optional().allow('', null),
    emergency_relation:    Joi.string().max(50).optional().allow('', null),
    emergency_phone:       Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow('', null),
    insurance_provider:    Joi.string().max(150).optional().allow('', null),
    insurance_policy_no:   Joi.string().max(100).optional().allow('', null),
    insurance_expiry:      Joi.date().iso().optional().allow('', null),
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password:     Joi.string().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
      .messages({ 'any.only': 'Passwords do not match' }),
  }),

  uploadPhoto: Joi.object({
    photo_url: Joi.string().uri().required(),
  }),
};

const validateBody = (schemaKey) => [validator.body(schemas[schemaKey])];

module.exports = { validateBody };
