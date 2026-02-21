import { configureStore } from '@reduxjs/toolkit';

import lang from '@/locale/translation/en_us';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

// Función para obtener el estado inicial de auth desde localStorage
const getInitialAuthState = () => {
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      // Verificar que el token existe y no ha expirado
      if (parsed.current && parsed.current.token && parsed.isLoggedIn) {
        console.log('🔑 Estado de auth restaurado desde localStorage');
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error al restaurar estado de auth:', error);
    localStorage.removeItem('auth');
  }
  return AUTH_INITIAL_STATE;
};

const auth_state = getInitialAuthState();

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

// Variable para mantener referencia del último estado de auth
let previousAuthState = auth_state;

// Suscribirse a cambios en el store para sincronizar con localStorage
store.subscribe(() => {
  const state = store.getState();
  
  // Solo actualizar localStorage si el estado de auth realmente cambió
  if (state.auth && state.auth !== previousAuthState) {
    try {
      // Verificar si realmente cambió el contenido, no solo la referencia
      const authChanged = JSON.stringify(state.auth) !== JSON.stringify(previousAuthState);
      
      if (authChanged) {
        console.log('🔄 Actualizando auth en localStorage');
        localStorage.setItem('auth', JSON.stringify(state.auth));
        previousAuthState = state.auth;
      }
    } catch (error) {
      console.error('❌ Error al sincronizar auth con localStorage:', error);
    }
  }
});

console.log(
  '🚀 Desarrollado por Samuel Carrillo.'
);

export default store;
