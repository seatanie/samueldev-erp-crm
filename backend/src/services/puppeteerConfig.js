const puppeteer = require('puppeteer');

// Configuración para Puppeteer en Alpine Linux
const puppeteerConfig = {
  // Usar Chromium instalado en el sistema
  executablePath: '/usr/bin/chromium-browser',
  
  // Argumentos para Chromium en entorno headless
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection'
  ],
  
  // Configuración del navegador
  headless: true,
  ignoreHTTPSErrors: true,
  timeout: 30000
};

// Función para obtener una instancia de Puppeteer configurada
const getPuppeteerInstance = async () => {
  try {
    const browser = await puppeteer.launch(puppeteerConfig);
    return browser;
  } catch (error) {
    console.error('❌ Error iniciando Puppeteer:', error);
    throw error;
  }
};

module.exports = {
  puppeteerConfig,
  getPuppeteerInstance
};
