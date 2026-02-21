const mongoose = require('mongoose');

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo enabled debe ser un booleano',
      });
    }

    const admin = await mongoose.model('Admin').findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado',
      });
    }

    // No permitir deshabilitar al owner
    if (admin.role === 'owner' && !enabled) {
      return res.status(400).json({
        success: false,
        message: 'No se puede deshabilitar al propietario de la cuenta',
      });
    }

    admin.enabled = enabled;
    admin.updated = Date.now();
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `Administrador ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
      result: admin,
    });
  } catch (error) {
    console.error('Error en toggleStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = toggleStatus;
