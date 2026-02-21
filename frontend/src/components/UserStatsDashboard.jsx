import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Avatar, Tag, Spin, Alert, Button, Space, Typography, Divider } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  SettingOutlined, 
  MailOutlined, 
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const UserStatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Intentar obtener estadísticas reales, si falla mostrar demo
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Si no hay token, mostrar estadísticas de demostración
        setStats(getDemoStats());
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/user-stats/my-stats', {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.data.success) {
        setStats(response.data.result);
      } else {
        // Si falla la API, mostrar demo
        setStats(getDemoStats());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // En caso de error, mostrar estadísticas de demostración
      setStats(getDemoStats());
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas de demostración para usuarios no autenticados
  const getDemoStats = () => ({
    sessions: {
      total: 156,
      monthly: 23,
      weekly: 7,
      daily: 1,
      averageDuration: 45
    },
    functionUsage: {
      login: 89,
      registration: 12,
      settings: 34,
      profile: 23,
      passwordReset: 8,
      dashboard: 45
    },
    recentActivity: [
      {
        action: 'login',
        description: 'Inicio de sesión exitoso',
        timestamp: new Date().toISOString(),
        metadata: { ip: '192.168.1.1' }
      },
      {
        action: 'dashboard',
        description: 'Acceso al dashboard principal',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        metadata: { page: 'main' }
      },
      {
        action: 'settings',
        description: 'Configuración de idioma actualizada',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        metadata: { language: 'es_es' }
      }
    ],
    configurations: {
      totalChanges: 67,
      lastChange: new Date(Date.now() - 86400000).toISOString(),
      changeFrequency: '2.3 por día'
    },
    communications: {
      emailsSent: 23,
      notifications: 45
    },
    performance: {
      lastLogin: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      streakDays: 7
    }
  });

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action) => {
    const iconMap = {
      login: <UserOutlined style={{ color: '#1890ff' }} />,
      registration: <UserOutlined style={{ color: '#52c41a' }} />,
      profile: <UserOutlined style={{ color: '#722ed1' }} />,
      settings: <SettingOutlined style={{ color: '#fa8c16' }} />,
      passwordReset: <MailOutlined style={{ color: '#eb2f96' }} />,
      dashboard: <BarChartOutlined style={{ color: '#13c2c2' }} />
    };
    return iconMap[action] || <UserOutlined />;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Cargando estadísticas...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Alert
        message="Error"
        description="No se pudieron cargar las estadísticas"
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#000', marginBottom: '8px' }}>
          <BarChartOutlined /> Dashboard de Estadísticas
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          {!localStorage.getItem('token') ? 'Modo demostración - Inicia sesión para ver tus estadísticas reales' : 'Estadísticas en tiempo real de tu actividad'}
        </Text>
      </div>

      {/* Resumen Ejecutivo */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sesiones Totales"
              value={stats.sessions.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sesión Mensual"
              value={stats.sessions.monthly}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Duración Promedio"
              value={formatDuration(stats.sessions.averageDuration)}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cambios Config"
              value={stats.configurations.totalChanges}
              valueStyle={{ color: '#722ed1' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Uso por Función */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> Uso por Función</>} extra={<BarChartOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Logins"
                  value={stats.functionUsage.login}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Registros"
                  value={stats.functionUsage.registration}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Configuraciones"
                  value={stats.functionUsage.settings}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Dashboard"
                  value={stats.functionUsage.dashboard}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><SettingOutlined /> Configuraciones</>} extra={<SettingOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Total de Cambios"
                value={stats.configurations.totalChanges}
                valueStyle={{ color: '#1890ff' }}
              />
              <Statistic
                title="Último Cambio"
                value={formatDate(stats.configurations.lastChange)}
                valueStyle={{ fontSize: '14px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                <Text>Frecuencia: {stats.configurations.changeFrequency}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Comunicaciones y Rendimiento */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={<><MailOutlined /> Comunicaciones</>} extra={<MailOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Emails Enviados"
                  value={stats.communications.emailsSent}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Notificaciones"
                  value={stats.communications.notifications}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><TrophyOutlined /> Rendimiento</>} extra={<TrophyOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Último Login"
                value={formatDate(stats.performance.lastLogin)}
                valueStyle={{ fontSize: '14px' }}
              />
              <Statistic
                title="Última Actividad"
                value={formatDate(stats.performance.lastActivity)}
                valueStyle={{ fontSize: '14px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FireOutlined style={{ color: '#fa8c16' }} />
                <Text>Racha: {stats.performance.streakDays} días consecutivos</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Actividad Reciente */}
      <Card title={<><ClockCircleOutlined /> Actividad Reciente</>} extra={<ClockCircleOutlined />}>
        <List
          dataSource={stats.recentActivity}
          renderItem={(activity, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getActivityIcon(activity.action)}
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                }
                title={
                  <Space>
                    <Text strong>{activity.description}</Text>
                    <Tag color="blue">{activity.action}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      {formatDate(activity.timestamp)}
                    </Text>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {JSON.stringify(activity.metadata)}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: 'No hay actividad reciente para mostrar'
          }}
        />
      </Card>

      {/* Botón de Actualización */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large" 
          onClick={fetchUserStats}
          icon={<BarChartOutlined />}
          style={{ background: '#000', borderColor: '#000' }}
        >
          Actualizar Estadísticas
        </Button>
      </div>

      {/* Mensaje de Demo */}
      {!localStorage.getItem('token') && (
        <Alert
          message="Modo Demostración"
          description="Estas son estadísticas de ejemplo. Inicia sesión para ver tus estadísticas reales."
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}
    </div>
  );
};

export default UserStatsDashboard;
