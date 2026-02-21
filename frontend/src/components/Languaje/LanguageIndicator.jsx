// src/components/LanguageIndicator.jsx
import { Badge, Tooltip } from "antd";
import { useMemo } from "react";
import useLanguage from "@/locale/useLanguage";

const LANGUAGE_FLAGS = {
  es_es: "🇪🇸",
  en_us: "🇺🇸",
};

const LANGUAGE_NAMES = {
  es_es: "Español",
  en_us: "English",
};

export default function LanguageIndicator() {
  const translate = useLanguage();
  
  const currentLang = useMemo(
    () => localStorage.getItem("currentLang") || "es_es",
    []
  );

  const currentFlag = LANGUAGE_FLAGS[currentLang] || "🌐";
  const currentName = LANGUAGE_NAMES[currentLang] || "Unknown";

  return (
    <Tooltip title={`${translate('language')}: ${currentName}`} placement="bottom">
      <Badge 
        count={currentFlag} 
        style={{ 
          backgroundColor: '#52c41a',
          fontSize: '16px',
          padding: '4px 8px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        className="language-indicator"
      />
    </Tooltip>
  );
}
