import { useCallback } from 'react';
import axios from 'axios';

const useUserStats = () => {
  // Registrar actividad del usuario
  const recordActivity = useCallback(async (action, description, metadata = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No hay token para registrar actividad');
        return false;
      }

      await axios.post('/api/user-stats/record-activity', {
        action,
        description,
        metadata
      }, {
        headers: {
          'x-auth-token': token
        }
      });

      return true;
    } catch (error) {
      console.error('Error registrando actividad:', error);
      return false;
    }
  }, []);

  // Actualizar estadísticas de sesión
  const updateSessionStats = useCallback(async (durationMinutes) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No hay token para actualizar estadísticas de sesión');
        return false;
      }

      await axios.post('/api/user-stats/update-session', {
        durationMinutes
      }, {
        headers: {
          'x-auth-token': token
        }
      });

      return true;
    } catch (error) {
      console.error('Error actualizando estadísticas de sesión:', error);
      return false;
    }
  }, []);

  // Registrar login
  const recordLogin = useCallback(async () => {
    return await recordActivity(
      'login',
      'Inicio de sesión exitoso',
      { timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar registro
  const recordRegistration = useCallback(async () => {
    return await recordActivity(
      'registration',
      'Usuario registrado exitosamente',
      { timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar cambio de configuración
  const recordConfigChange = useCallback(async (configType, details = {}) => {
    return await recordActivity(
      'settings',
      `Configuración ${configType} actualizada`,
      { configType, details, timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar cambio de perfil
  const recordProfileChange = useCallback(async (changeType, details = {}) => {
    return await recordActivity(
      'profile',
      `Perfil ${changeType} actualizado`,
      { changeType, details, timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar restablecimiento de contraseña
  const recordPasswordReset = useCallback(async (resetType = 'requested') => {
    const descriptions = {
      requested: 'Solicitud de restablecimiento de contraseña',
      completed: 'Contraseña restablecida exitosamente',
      failed: 'Intento fallido de restablecimiento de contraseña'
    };

    return await recordActivity(
      'passwordReset',
      descriptions[resetType] || descriptions.requested,
      { resetType, timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar acceso al dashboard
  const recordDashboardAccess = useCallback(async () => {
    return await recordActivity(
      'dashboard',
      'Acceso al dashboard de estadísticas',
      { timestamp: new Date().toISOString() }
    );
  }, [recordActivity]);

  // Registrar tiempo de sesión al cerrar
  const recordSessionEnd = useCallback(async (startTime) => {
    if (!startTime) return false;
    
    const endTime = new Date();
    const durationMs = endTime - new Date(startTime);
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes > 0) {
      return await updateSessionStats(durationMinutes);
    }
    
    return false;
  }, [updateSessionStats]);

  return {
    recordActivity,
    updateSessionStats,
    recordLogin,
    recordRegistration,
    recordConfigChange,
    recordProfileChange,
    recordPasswordReset,
    recordDashboardAccess,
    recordSessionEnd
  };
};

export default useUserStats;









