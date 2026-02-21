const mongoose = require('mongoose');

const getGeneralStats = async (req, res) => {
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
    const PaymentModel = mongoose.model('Payment');
    const CustomerModel = mongoose.model('Customer');
    const QuoteModel = mongoose.model('Quote');
    
    // Obtener estadísticas generales
    const [
      invoiceStats,
      paymentStats,
      customerStats,
      quoteStats
    ] = await Promise.all([
      InvoiceModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),
      PaymentModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      CustomerModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]),
      QuoteModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const result = {
      invoices: {
        total: invoiceStats[0]?.total || 0,
        count: invoiceStats[0]?.count || 0
      },
      payments: {
        total: paymentStats[0]?.total || 0,
        count: paymentStats[0]?.count || 0
      },
      customers: {
        count: customerStats[0]?.count || 0
      },
      quotes: {
        total: quoteStats[0]?.total || 0,
        count: quoteStats[0]?.count || 0
      }
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
      message: 'Estadísticas generales obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = getGeneralStats;
