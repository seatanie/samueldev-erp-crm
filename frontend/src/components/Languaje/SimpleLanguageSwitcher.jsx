// src/components/SimpleLanguageSwitcher.jsx
import { Select } from "antd";
import { useLanguageContext } from "@/context/LanguageContext";
import { useCallback } from "react";

// Versión mejorada con banderas que se muestran correctamente
const LANGS = [
  {
    label: "🇪🇸 Español",
    value: "es_es"
  },
  {
    label: "🇺🇸 Inglés",
    value: "en_us"
  },
];

export default function SimpleLanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguageContext();

  // Función optimizada para cambiar idioma sin causar logout
  const handleLanguageChange = useCallback((newLang) => {
    if (newLang === currentLanguage) return;
    
    console.log('🔄 Cambiando idioma a:', newLang);
    
    // Cambiar idioma de forma segura
    try {
      changeLanguage(newLang);
      console.log('✅ Idioma cambiado exitosamente');
    } catch (error) {
      console.error('❌ Error al cambiar idioma:', error);
    }
  }, [currentLanguage, changeLanguage]);

  return (
    <Select
      value={currentLanguage}
      onChange={handleLanguageChange}
      options={LANGS}
      style={{
        minWidth: 120,
        borderRadius: '6px'
      }}
      placeholder="Seleccionar idioma"
      // Evitar problemas con el focus
      onBlur={(e) => e.preventDefault()}
    />
  );
}
