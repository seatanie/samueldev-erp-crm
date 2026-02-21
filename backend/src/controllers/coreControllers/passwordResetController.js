const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/coreModels/Admin');
const PasswordReset = require('../../models/coreModels/PasswordReset');
const { sendPasswordResetEmail } = require('../../services/emailService');

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Verificar si el usuario existe
    const user = await Admin.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de restablecimiento'
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Crear registro de restablecimiento
    const passwordReset = new PasswordReset({
      email: email.toLowerCase(),
      token: token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hora
    });

    await passwordReset.save();

    // Enviar email con el enlace
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${token}`;
    
    await sendPasswordResetEmail(email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: 'Enlace de restablecimiento enviado a tu correo electrónico'
    });

  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar token de restablecimiento
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar el token en la base de datos
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar si el token es válido
    if (!passwordReset.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado o ya utilizado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token válido',
      email: passwordReset.email
    });

  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validar datos
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar el token
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar si el token es válido
    if (!passwordReset.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado o ya utilizado'
      });
    }

    // Buscar el usuario
    const user = await Admin.findOne({ email: passwordReset.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Hashear nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña del usuario
    user.password = hashedPassword;
    await user.save();

    // Marcar token como usado
    await passwordReset.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};
