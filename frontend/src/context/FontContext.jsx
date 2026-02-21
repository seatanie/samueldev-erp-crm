import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Tipos de acción
const FONT_ACTIONS = {
  SET_FONT: 'SET_FONT',
  LOAD_FONT: 'LOAD_FONT',
};

// Estado inicial
const initialState = {
  currentFont: 'Nunito',
  fonts: [
    { name: 'Nunito', value: 'Nunito', displayName: 'Nunito' },
    { name: 'Montserrat', value: 'Montserrat', displayName: 'Montserrat' },
    { name: 'Poppins', value: 'Poppins', displayName: 'Poppins' },
    { name: 'Inter', value: 'Inter', displayName: 'Inter' },
    { name: 'Roboto', value: 'Roboto', displayName: 'Roboto' },
  ],
};

// Reducer
function fontReducer(state, action) {
  switch (action.type) {
    case FONT_ACTIONS.SET_FONT:
      return {
        ...state,
        currentFont: action.payload,
      };
    case FONT_ACTIONS.LOAD_FONT:
      return {
        ...state,
        fonts: [...state.fonts, action.payload],
      };
    default:
      return state;
  }
}

// Crear contexto
const FontContext = createContext();

// Provider
export function FontProvider({ children }) {
  const [state, dispatch] = useReducer(fontReducer, initialState);

  // Cargar fuente desde localStorage al inicializar
  useEffect(() => {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
      dispatch({ type: FONT_ACTIONS.SET_FONT, payload: savedFont });
    }
  }, []);

  // Guardar fuente en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('selectedFont', state.currentFont);
    
    // Aplicar la fuente al documento
    document.documentElement.style.setProperty('--app-font-family', state.currentFont);
    
    // Actualizar el CSS global
    const style = document.getElementById('dynamic-font-style');
    if (style) {
      style.textContent = `
        * {
          font-family: '${state.currentFont}', sans-serif !important;
        }
      `;
    } else {
      const newStyle = document.createElement('style');
      newStyle.id = 'dynamic-font-style';
      newStyle.textContent = `
        * {
          font-family: '${state.currentFont}', sans-serif !important;
        }
      `;
      document.head.appendChild(newStyle);
    }
  }, [state.currentFont]);

  const setFont = (fontName) => {
    dispatch({ type: FONT_ACTIONS.SET_FONT, payload: fontName });
  };

  const value = {
    ...state,
    setFont,
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
}

// Hook personalizado
export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont debe ser usado dentro de FontProvider');
  }
  return context;
}

export default FontContext;











