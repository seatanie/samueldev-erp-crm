const mongoose = require('mongoose');

const getPaymentStats = async (req, res) => {
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

    const PaymentModel = mongoose.model('Payment');
    
    // Obtener estadísticas de pagos
    const stats = await PaymentModel.aggregate([
      {
        $match: {
          created: { $gte: startDate, $lte: endDate },
          removed: false
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      averageAmount: 0
    };
    
    return res.status(200).json({
      success: true,
      result: {
        period,
        year: currentYear,
        startDate,
        endDate,
        stats: result
      },
      message: 'Estadísticas de pagos obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = getPaymentStats;
