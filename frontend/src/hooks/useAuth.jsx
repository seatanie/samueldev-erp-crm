import { useSelector } from 'react-redux';
import { selectCurrentAdmin, isLoggedIn } from '@/redux/auth/selectors';
import { useEffect } from 'react';

export const useAuth = () => {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const loggedIn = useSelector(isLoggedIn);

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return loggedIn && currentAdmin && currentAdmin.token;
  };

  // Obtener el token de autenticación
  const getToken = () => {
    return currentAdmin?.token;
  };

  // Verificar si el token existe en localStorage como respaldo
  const hasLocalToken = () => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.current && parsed.current.token && parsed.isLoggedIn;
      }
    } catch (error) {
      console.error('Error al verificar token local:', error);
    }
    return false;
  };

  // Sincronizar estado de Redux con localStorage
  useEffect(() => {
    if (isAuthenticated() && !hasLocalToken()) {
      // Si Redux tiene el estado pero localStorage no, sincronizar
      try {
        const authState = {
          current: currentAdmin,
          isLoggedIn: loggedIn,
          isLoading: false,
          isSuccess: true,
        };
        localStorage.setItem('auth', JSON.stringify(authState));
        console.log('🔄 Estado de auth sincronizado con localStorage');
      } catch (error) {
        console.error('Error al sincronizar auth:', error);
      }
    }
  }, [currentAdmin, loggedIn]);

  return {
    currentAdmin,
    loggedIn,
    isAuthenticated: isAuthenticated(),
    getToken,
    hasLocalToken: hasLocalToken(),
  };
};
