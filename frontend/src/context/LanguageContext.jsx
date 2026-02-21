// src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext debe usarse dentro de LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("currentLang") || "es_es";
  });

  const changeLanguage = useCallback((newLang) => {
    if (newLang === currentLanguage) return;
    
    // Cambio de estado una sola vez
    setCurrentLanguage(newLang);
    
    // Actualizar localStorage
    localStorage.setItem("currentLang", newLang);
    
    // Actualizar atributo del HTML
    document.documentElement.lang = newLang;
    
    // Notificar cambio a otros componentes
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
  }, [currentLanguage]);

  // Sincronizar con localStorage solo al montar el componente
  useEffect(() => {
    const storedLang = localStorage.getItem("currentLang");
    if (storedLang && storedLang !== currentLanguage) {
      console.log('🔄 Sincronizando idioma inicial:', storedLang);
      setCurrentLanguage(storedLang);
      document.documentElement.lang = storedLang;
    }
  }, []); // Solo se ejecuta una vez al montar

  const value = {
    currentLanguage,
    changeLanguage,
    isSpanish: currentLanguage === 'es_es',
    isEnglish: currentLanguage === 'en_us'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
