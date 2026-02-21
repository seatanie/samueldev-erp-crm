const mongoose = require('mongoose');

const getInvoiceStats = async (req, res) => {
  try {
    const { period, year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    // Calcular fechas según el período
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(currentYear, now.getMonth() - 1, 1);
        endDate = new Date(currentYear, now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(currentYear - 1, 0, 1);
        endDate = new Date(currentYear - 1, 11, 31);
        break;
      case 'all':
        startDate = new Date(0); // Desde el principio
        endDate = now;
        break;
      default:
        startDate = new Date(currentYear, now.getMonth() - 1, 1);
        endDate = new Date(currentYear, now.getMonth(), 0);
    }

    const InvoiceModel = mongoose.model('Invoice');
    
    // Obtener estadísticas de facturas
    const stats = await InvoiceModel.aggregate([
      {
        $match: {
          created: { $gte: startDate, $lte: endDate },
          removed: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Procesar resultados
    const result = {
      paid: { count: 0, amount: 0 },
      unpaid: { count: 0, amount: 0 },
      proforma: { count: 0, amount: 0 },
      draft: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case 'paid':
          result.paid = { count: stat.count, amount: stat.totalAmount };
          break;
        case 'unpaid':
          result.unpaid = { count: stat.count, amount: stat.totalAmount };
          break;
        case 'proforma':
          result.proforma = { count: stat.count, amount: stat.totalAmount };
          break;
        case 'draft':
          result.draft = { count: stat.count, amount: stat.totalAmount };
          break;
      }
    });

    return res.status(200).json({
      success: true,
      result: {
        period,
        year: currentYear,
        startDate,
        endDate,
        stats: result
      },
      message: 'Estadísticas de facturas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de facturas:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = getInvoiceStats;
