const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const create = async (req, res) => {
  try {
    const AdminModel = mongoose.model('Admin');
    const AdminPasswordModel = mongoose.model('AdminPassword');
    
    const { password, ...adminData } = req.body;
    
    // Validar que se proporcione contraseña
    if (!password) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'La contraseña es requerida',
      });
    }

    // Generar salt y hash de la contraseña
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(salt + password, 10);

    // Crear el admin con la contraseña hasheada (el modelo la requiere)
    const admin = new AdminModel({
      ...adminData,
      password: hashedPassword, // Incluir la contraseña hasheada
      removed: false,
    });
    
    const savedAdmin = await admin.save();

    // Crear el registro de contraseña en AdminPassword
    const adminPassword = new AdminPasswordModel({
      user: savedAdmin._id,
      password: hashedPassword,
      salt: salt,
      removed: false,
    });

    await adminPassword.save();

    // Retornar respuesta exitosa (sin incluir la contraseña)
    const adminResponse = savedAdmin.toObject();
    delete adminResponse.password; // No enviar la contraseña en la respuesta

    return res.status(200).json({
      success: true,
      result: adminResponse,
      message: 'Administrador creado exitosamente',
    });

  } catch (error) {
    console.error('Error creando admin:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = create;
