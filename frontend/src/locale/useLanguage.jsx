import languages from "./translation/translation";

const DEFAULT_LANG = "es_es"; 

const getLabel = (key) => {
  try {
    const currentLang =
      localStorage.getItem("currentLang") || DEFAULT_LANG;

    const lang = languages[currentLang] || {};
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/ /g, "_");

    // Si existe en el diccionario, devuelve traducción
    if (lang[lowerCaseKey]) return lang[lowerCaseKey];

    // Fallback: genera un label bonito
    const removeUnderscore = key.replace(/_/g, " ").split(" ");
    const converted = removeUnderscore.map(
      (word) => word[0].toUpperCase() + word.substring(1)
    );
    return converted.join(" ");
  } catch (error) {
    return "No translate";
  }
};

const useLanguage = () => {
  const translate = (value) => getLabel(value);

  return translate;
};

export default useLanguage;

export const setAppLanguage = (code) => {
  window.localStorage.setItem("currentLang", code);
};