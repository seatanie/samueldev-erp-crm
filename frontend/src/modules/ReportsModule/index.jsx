import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Select, Typography, Space, Spin, message } from 'antd';
import { 
  CalendarOutlined, 
  DollarOutlined, 
  FileTextOutlined, 
  CreditCardOutlined,
  BarChartOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useLanguage from '@/locale/useLanguage';
import useMoney from '@/settings/useMoney';
import reportsService from '@/services/reportsService';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ReportsModule() {
  const translate = useLanguage();
  const { moneyFormatter, currency_symbol } = useMoney();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Estado para datos reales
  const [cardData, setCardData] = useState({
    paidInvoice: { value: 0, period: 'month', color: '#52c41a' },
    unpaidInvoice: { value: 0, period: 'month', color: '#ff4d4f' },
    proformaInvoice: { value: 0, period: 'month', color: '#1890ff' },
    offer: { value: 0, period: 'month', color: '#722ed1' }
  });

  const [chartData, setChartData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Función para formatear moneda usando la configuración de la app
  const formatCurrency = (value) => {
    if (value === 0) return `${currency_symbol || '$'} 0.00`;
    return moneyFormatter({ amount: value });
  };

  // Función para obtener el texto del período
  const getPeriodText = (period) => {
    switch (period) {
      case 'week': return 'Semana Pasada';
      case 'month': return 'Mes Pasado';
      case 'quarter': return 'Trimestre Pasado';
      case 'year': return 'Año Pasado';
      default: return 'Mes Pasado';
    }
  };

  // Función para cargar datos reales del backend
  const loadData = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    
    try {
      console.log('🔄 Cargando datos de informes...', { timeFilter, yearFilter });
      
      // Cargar estadísticas de facturas
      const invoiceStats = await reportsService.getInvoiceStats(timeFilter, yearFilter);
      console.log('📊 Estadísticas de facturas:', invoiceStats);
      
      if (invoiceStats.success) {
        const stats = invoiceStats.result.stats;
        setCardData({
          paidInvoice: { 
            value: stats.paid.amount || 0, 
            period: timeFilter, 
            color: '#52c41a' 
          },
          unpaidInvoice: { 
            value: stats.unpaid.amount || 0, 
            period: timeFilter, 
            color: '#ff4d4f' 
          },
          proformaInvoice: { 
            value: stats.proforma.amount || 0, 
            period: timeFilter, 
            color: '#1890ff' 
          },
          offer: { 
            value: 0, // Por ahora 0, se puede implementar después
            period: timeFilter, 
            color: '#722ed1' 
          }
        });
        setConnectionStatus('connected');
      } else {
        console.warn('⚠️ No se pudieron cargar las estadísticas de facturas:', invoiceStats.message);
        message.warning('No se pudieron cargar las estadísticas de facturas');
        setConnectionStatus('error');
      }

      // Cargar datos del gráfico anual
      const chartDataResponse = await reportsService.getAnnualChartData(yearFilter);
      console.log('📈 Datos del gráfico anual:', chartDataResponse);
      
      if (chartDataResponse.success) {
        setChartData(chartDataResponse.result.data || []);
      } else {
        console.warn('⚠️ No se pudieron cargar los datos del gráfico:', chartDataResponse.message);
        message.warning('No se pudieron cargar los datos del gráfico');
      }

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      message.error('Error al cargar los datos de informes: ' + (error.message || 'Error desconocido'));
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeFilter, yearFilter]);

  // Componente de tarjeta de resumen
  const SummaryCard = ({ title, value, period, color, icon: Icon }) => (
    <Card 
      className="summary-card"
      style={{ 
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Title level={5} style={{ color: '#722ed1', margin: 0, fontSize: '16px' }}>
            {title}
          </Title>
          <Icon style={{ color: color, fontSize: '20px' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Button 
            size="small" 
            style={{ 
              backgroundColor: '#f5f5f5', 
              border: 'none', 
              borderRadius: '6px',
              color: '#666'
            }}
            icon={<CalendarOutlined />}
          >
            {getPeriodText(period)}
          </Button>
        </div>
        
        <div style={{ 
          backgroundColor: `${color}15`, 
          border: `1px solid ${color}30`,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <Text style={{ 
            color: color, 
            fontSize: '18px', 
            fontWeight: 'bold',
            display: 'block'
          }}>
            {formatCurrency(value)}
          </Text>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="reports-module whiteBox shadow" style={{ margin: '20px auto', width: '100%', maxWidth: '1200px', flex: 'none', padding: '24px', marginBottom: '40px' }}>
      <PageHeader
        title="Informes"
        ghost={true}
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        style={{ padding: '0 0 24px 0' }}
        extra={[
          <div key="status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 
                  connectionStatus === 'connected' ? '#52c41a' :
                  connectionStatus === 'error' ? '#ff4d4f' : '#faad14'
              }}
            />
            <Text style={{ fontSize: '12px', color: '#666' }}>
              {connectionStatus === 'connected' ? 'Conectado' :
               connectionStatus === 'error' ? 'Error de conexión' : 'Verificando...'}
            </Text>
          </div>
        ]}
      />

      {/* Filtros */}
      <Card className="filters-card" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Text strong>{translate('period')}:</Text>
            <Select 
              value={timeFilter} 
              onChange={setTimeFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              <Option value="yesterday">{translate('yesterday')}</Option>
              <Option value="week">{translate('last_week')}</Option>
              <Option value="month">{translate('last_month')}</Option>
              <Option value="year">{translate('last_year')}</Option>
              <Option value="all">{translate('from_beginning')}</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>{translate('year')}:</Text>
            <Select 
              value={yearFilter} 
              onChange={setYearFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>Tipo de Documento:</Text>
            <Select 
              value={documentTypeFilter} 
              onChange={setDocumentTypeFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              <Option value="all">Todos</Option>
              <Option value="invoice">Factura</Option>
              <Option value="proforma">Proforma</Option>
              <Option value="quote">Cotización</Option>
              <Option value="offer">Oferta</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>Estado:</Text>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              <Option value="all">Todos</Option>
              <Option value="paid">Pagado</Option>
              <Option value="unpaid">Impagado</Option>
              <Option value="partial">Parcial</Option>
              <Option value="overdue">Vencido</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>Cliente:</Text>
            <Select 
              value={customerFilter} 
              onChange={setCustomerFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
              placeholder="Seleccionar cliente"
              allowClear
            >
              <Option value="all">Todos los Clientes</Option>
              <Option value="vip">Clientes VIP</Option>
              <Option value="regular">Clientes Regulares</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>Método de Pago:</Text>
            <Select 
              value={paymentMethodFilter} 
              onChange={setPaymentMethodFilter}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              <Option value="all">Todos</Option>
              <Option value="cash">Efectivo</Option>
              <Option value="card">Tarjeta</Option>
              <Option value="transfer">Transferencia</Option>
              <Option value="check">Cheque</Option>
            </Select>
          </Col>
        </Row>
        
        {/* Botones de acción */}
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Space>
              <Button 
                type="primary" 
                onClick={loadData}
                loading={loading}
                icon={<BarChartOutlined />}
              >
                Actualizar Reporte
              </Button>
              <Button 
                onClick={() => {
                  setTimeFilter('month');
                  setYearFilter(new Date().getFullYear());
                  setDocumentTypeFilter('all');
                  setStatusFilter('all');
                  setCustomerFilter('all');
                  setPaymentMethodFilter('all');
                }}
              >
                Limpiar Filtros
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tarjetas de resumen */}
      <Row gutter={[24, 24]} className="stats-grid" style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <SummaryCard
            title="Factura Pagada"
            value={cardData.paidInvoice.value}
            period={cardData.paidInvoice.period}
            color={cardData.paidInvoice.color}
            icon={CreditCardOutlined}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <SummaryCard
            title="Factura Impagada"
            value={cardData.unpaidInvoice.value}
            period={cardData.unpaidInvoice.period}
            color={cardData.unpaidInvoice.color}
            icon={FileTextOutlined}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <SummaryCard
            title="Factura Proforma"
            value={cardData.proformaInvoice.value}
            period={cardData.proformaInvoice.period}
            color={cardData.proformaInvoice.color}
            icon={FileTextOutlined}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <SummaryCard
            title="Oferta"
            value={cardData.offer.value}
            period={cardData.offer.period}
            color={cardData.offer.color}
            icon={DollarOutlined}
          />
        </Col>
      </Row>

      {/* Gráfico anual */}
      <Card 
        className="chart-container"
        title={
          <Space>
            <BarChartOutlined style={{ color: '#1890ff' }} />
            <span>Análisis Anual {yearFilter}</span>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                  iconSize={12}
                />
                <Bar 
                  dataKey="payment" 
                  fill="#1890ff" 
                  radius={[4, 4, 0, 0]}
                  name="Pagos"
                />
                <Bar 
                  dataKey="invoice" 
                  fill="#52c41a" 
                  radius={[4, 4, 0, 0]}
                  name="Facturas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Spin>
      </Card>
    </div>
  );
}
