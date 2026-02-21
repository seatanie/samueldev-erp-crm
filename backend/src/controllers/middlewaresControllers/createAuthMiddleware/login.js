const Joi = require('joi');
const mongoose = require('mongoose');
const authUser = require('./authUser');
const logger = require('../../../utils/logger');

const login = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password');
  const UserModel = mongoose.model(userModel);
  const { email, password } = req.body;

  // Log seguro de datos recibidos
  logger.auth('Intento de login', { email, hasPassword: !!password });

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ email, password });
  
  if (error) {
    logger.error('Validación de login fallida', error.message);
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  const user = await UserModel.findOne({ email: email, removed: false });

  logger.auth('Usuario encontrado', user ? { 
    id: user._id, 
    email: user.email, 
    enabled: user.enabled 
  } : null);

  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const databasePassword = await UserPasswordModel.findOne({ user: user._id, removed: false });

  // Validar que existe la contraseña del usuario
  if (!databasePassword) {
    logger.error('Contraseña no encontrada en BD para usuario', { userId: user._id });
    return res.status(404).json({
      success: false,
      result: null,
      message: 'User password not found. Please contact administrator.',
    });
  }

  if (!user.enabled) {
    logger.security('Intento de login con usuario deshabilitado', { email });
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });
  }

  logger.auth('Validaciones pasadas, procediendo a autenticación', { userId: user._id });

  //  authUser if your has correct password
  authUser(req, res, {
    user,
    databasePassword,
    password,
    UserPasswordModel,
  });
};

module.exports = login;
