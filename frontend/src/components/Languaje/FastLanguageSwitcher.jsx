// src/components/FastLanguageSwitcher.jsx
import { Button, Tooltip } from "antd";
import { useState, useEffect, useCallback } from "react";
import { setAppLanguage } from "@/locale/useLanguage";
import useLanguage from "@/locale/useLanguage";

const LANGS = [
  { 
    label: "Español", 
    value: "es_es",
    flag: "🇪🇸"
  },
  { 
    label: "English", 
    value: "en_us",
    flag: "🇺🇸"
  },
];

export default function FastLanguageSwitcher() {
  const translate = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("currentLang") || "es_es";
  });

  // Función optimizada para cambiar idioma sin causar logout
  const handleLanguageChange = useCallback((newLang) => {
    if (newLang === currentLanguage) return;
    
    console.log('🔄 Cambiando idioma a:', newLang);
    
    try {
      // Cambio inmediato del estado local
      setCurrentLanguage(newLang);
      
      // Actualizar función de idioma
      setAppLanguage(newLang);
      
      // Feedback visual
      const button = document.querySelector(`[data-lang="${newLang}"]`);
      if (button) {
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
      
      console.log('✅ Idioma cambiado exitosamente');
      
      // NO hacer reload automático - dejar que el contexto maneje el cambio
      // window.location.reload();
    } catch (error) {
      console.error('❌ Error al cambiar idioma:', error);
    }
  }, [currentLanguage]);

  // Sincronizar con localStorage solo al montar
  useEffect(() => {
    const storedLang = localStorage.getItem("currentLang");
    if (storedLang && storedLang !== currentLanguage) {
      setCurrentLanguage(storedLang);
    }
  }, []); // Solo se ejecuta una vez

  return (
    <div className="fast-language-switcher">
      {LANGS.map((lang) => (
        <Tooltip 
          key={lang.value} 
          title={`${translate('change_language')} - ${lang.label}`} 
          placement="bottom"
        >
          <Button
            type={currentLanguage === lang.value ? "primary" : "text"}
            size="small"
            onClick={() => handleLanguageChange(lang.value)}
            data-lang={lang.value}
            className={`lang-button ${currentLanguage === lang.value ? 'active' : ''}`}
            style={{
              fontSize: '18px',
              padding: '4px 8px',
              margin: '0 2px',
              borderRadius: '6px',
              border: currentLanguage === lang.value ? '2px solid #1890ff' : '2px solid transparent',
              transition: 'all 0.2s ease',
              minWidth: 'auto'
            }}
          >
            {lang.flag}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
