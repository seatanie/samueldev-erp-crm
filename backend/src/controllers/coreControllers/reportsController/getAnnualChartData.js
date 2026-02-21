const mongoose = require('mongoose');

const getAnnualChartData = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const InvoiceModel = mongoose.model('Invoice');
    const PaymentModel = mongoose.model('Payment');
    
    // Obtener datos mensuales para el año especificado
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      // Obtener pagos del mes
      const payments = await PaymentModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      // Obtener gastos del mes (simulado por ahora)
      const expenses = await InvoiceModel.aggregate([
        {
          $match: {
            created: { $gte: startDate, $lte: endDate },
            removed: false,
            status: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ]);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthlyData.push({
        month: monthNames[month],
        payment: payments[0]?.total || 0,
        expense: expenses[0]?.total || 0
      });
    }
    
    return res.status(200).json({
      success: true,
      result: {
        year: currentYear,
        data: monthlyData
      },
      message: 'Datos del gráfico anual obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo datos del gráfico anual:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = getAnnualChartData;
