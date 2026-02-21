// src/components/LanguageSwitcher.jsx
import { Select, Tooltip } from "antd";
import { useMemo, useState, useCallback, useEffect } from "react";
import { setAppLanguage } from "@/locale/useLanguage";
import useLanguage from "@/locale/useLanguage";

const LANGS = [
  { 
    label: "🇪🇸 Español", 
    value: "es_es",
    flag: "🇪🇸"
  },
  { 
    label: "🇺🇸 English", 
    value: "en_us",
    flag: "🇺🇸"
  },
];

export default function LanguageSwitcher({ compact = false, reload = false }) {
  const translate = useLanguage();
  const [value, setValue] = useState(() => {
    // Inicializar directamente desde localStorage para evitar delay
    return localStorage.getItem("currentLang") || "es_es";
  });

  // Función optimizada para cambiar idioma sin causar problemas
  const onChange = useCallback((val) => {
    if (val === value) return; // Evitar cambios innecesarios
    
    console.log('🔄 Cambiando idioma a:', val);
    
    try {
      setValue(val);
      setAppLanguage(val);
      
      // Forzar actualización inmediata del DOM
      document.documentElement.lang = val;
      
      if (reload) {
        // Recarga inmediata si es necesario
        console.log('🔄 Recargando página...');
        window.location.reload();
      } else {
        // Disparar evento personalizado para notificar cambio
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: val }));
        console.log('✅ Idioma cambiado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al cambiar idioma:', error);
    }
  }, [value, reload]);

  // Sincronizar con localStorage solo al montar
  useEffect(() => {
    const currentLang = localStorage.getItem("currentLang") || "es_es";
    if (currentLang !== value) {
      setValue(currentLang);
    }
  }, []); // Solo se ejecuta una vez

  const getCurrentFlag = useMemo(() => {
    const currentLang = LANGS.find(lang => lang.value === value);
    return currentLang ? currentLang.flag : "🌐";
  }, [value]);

  return (
    <div className="language-switcher-container">
      <Tooltip title={translate('change_language')} placement="bottom">
        <Select
          size={compact ? "small" : "middle"}
          value={value}
          onChange={onChange}
          options={LANGS}
          className={compact ? "language-switcher-compact" : "language-switcher-normal"}
          style={{ 
            borderRadius: '6px'
          }}
          suffixIcon={
            <span className="language-flag">
              {getCurrentFlag}
            </span>
          }
          dropdownClassName="language-dropdown"
          placeholder={translate('language')}
          // Optimizaciones para mejor rendimiento
          showSearch={false}
          filterOption={false}
          notFoundContent={null}
          // Evitar problemas con el focus
          onBlur={(e) => e.preventDefault()}
        />
      </Tooltip>
    </div>
  );
}
