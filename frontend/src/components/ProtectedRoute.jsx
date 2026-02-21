import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, hasLocalToken, loggedIn } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loggedIn === undefined) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Verificando autenticación..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated && !hasLocalToken) {
    console.log('🔒 Ruta protegida - usuario no autenticado, redirigiendo...');
    window.location.href = '/login';
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return children;
};

export default ProtectedRoute;
