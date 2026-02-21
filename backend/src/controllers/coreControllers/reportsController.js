const Invoice = require('@/models/appModels/Invoice');
const Payment = require('@/models/appModels/Payment');
const Quote = require('@/models/appModels/Quote');
const Order = require('@/models/appModels/Order');

// Obtener estadísticas de facturas
const getInvoiceStats = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Calcular fechas según el período
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
    }

    // Consultas paralelas para obtener estadísticas
    const [paidInvoices, unpaidInvoices, proformaInvoices] = await Promise.all([
      // Facturas pagadas
      Invoice.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ]),
      
      // Facturas impagadas
      Invoice.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['unpaid', 'partial'] },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ]),
      
      // Facturas proforma
      Invoice.aggregate([
        {
          $match: {
            type: 'proforma',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ])
    ]);

    // Procesar resultados
    const stats = {
      paid: {
        count: paidInvoices[0]?.count || 0,
        amount: paidInvoices[0]?.totalAmount || 0
      },
      unpaid: {
        count: unpaidInvoices[0]?.count || 0,
        amount: unpaidInvoices[0]?.totalAmount || 0
      },
      proforma: {
        count: proformaInvoices[0]?.count || 0,
        amount: proformaInvoices[0]?.totalAmount || 0
      }
    };

    res.json({
      success: true,
      result: {
        stats,
        period,
        year,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de pagos
const getPaymentStats = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Calcular fechas según el período
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
    }

    // Obtener estadísticas de pagos
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Obtener pagos por método
    const paymentsByMethod = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: paymentStats[0] || { totalAmount: 0, count: 0, averageAmount: 0 },
      byMethod: paymentsByMethod,
      period,
      year,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener datos del gráfico anual
const getAnnualChartData = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Obtener datos mensuales de pagos
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Obtener datos mensuales de facturas
    const monthlyInvoices = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalAmount: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Crear array con todos los meses del año
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const chartData = months.map((monthName, index) => {
      const monthNumber = index + 1;
      const paymentData = monthlyPayments.find(p => p._id === monthNumber);
      const invoiceData = monthlyInvoices.find(i => i._id === monthNumber);

      return {
        month: monthName,
        payment: paymentData?.totalAmount || 0,
        invoice: invoiceData?.totalAmount || 0,
        paymentCount: paymentData?.count || 0,
        invoiceCount: invoiceData?.count || 0
      };
    });

    res.json({
      success: true,
      result: {
        data: chartData,
        year,
        summary: {
          totalPayments: monthlyPayments.reduce((sum, p) => sum + p.totalAmount, 0),
          totalInvoices: monthlyInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
          totalPaymentCount: monthlyPayments.reduce((sum, p) => sum + p.count, 0),
          totalInvoiceCount: monthlyInvoices.reduce((sum, i) => sum + i.count, 0)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos del gráfico anual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas generales
const getGeneralStats = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Calcular fechas según el período
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(year, now.getMonth() - 1, 1);
        endDate = new Date(year, now.getMonth(), 0);
    }

    // Obtener estadísticas generales
    const [invoiceStats, paymentStats, quoteStats, orderStats] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            count: { $sum: 1 },
            paidAmount: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0]
              }
            },
            unpaidAmount: {
              $sum: {
                $cond: [{ $in: ['$paymentStatus', ['unpaid', 'partial']] }, '$total', 0]
              }
            }
          }
        }
      ]),
      
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      Quote.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $multiply: ['$price', '$quantity'] } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const result = {
      invoices: invoiceStats[0] || { totalAmount: 0, count: 0, paidAmount: 0, unpaidAmount: 0 },
      payments: paymentStats[0] || { totalAmount: 0, count: 0 },
      quotes: quoteStats[0] || { totalAmount: 0, count: 0 },
      orders: orderStats[0] || { totalAmount: 0, count: 0 },
      period,
      year,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getInvoiceStats,
  getPaymentStats,
  getAnnualChartData,
  getGeneralStats
};
