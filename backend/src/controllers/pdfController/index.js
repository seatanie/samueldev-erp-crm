const pug = require('pug');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { getPuppeteerInstance } = require('@/services/puppeteerConfig');
const { listAllSettings, loadSettings } = require('@/middlewares/settings');
const { getData } = require('@/middlewares/serverData');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

exports.generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  result,
  callback
) => {
  try {
    const { targetLocation } = info;

    // Crear la carpeta de descarga si no existe
    const downloadDir = path.dirname(targetLocation);
    if (!fs.existsSync(downloadDir)) {
      console.log(`📁 Creando carpeta de descarga: ${downloadDir}`);
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // if PDF already exists, then delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // render pdf html

    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compile Pug template

      const settings = await loadSettings();
      const selectedLang = settings['samueldev_app_language'];
      const translate = useLanguage({ selectedLang });

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
      });
      
      // Generar PDF usando Puppeteer
      try {
        const browser = await getPuppeteerInstance();
        const page = await browser.newPage();
        
        // Configurar el contenido HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generar PDF
        await page.pdf({
          path: targetLocation,
          format: info.format,
          printBackground: true,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          }
        });
        
        await browser.close();
        
        if (callback) callback();
      } catch (error) {
        console.error('❌ Error generando PDF con Puppeteer:', error);
        throw error;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
