const nodemailer = require('nodemailer');

// Configuración del transportador de email
const createTransporter = () => {
  // Configuración para Outlook/Hotmail
  if (process.env.EMAIL_SERVICE === 'outlook' || process.env.EMAIL_SERVICE === 'hotmail') {
    console.log('📧 Configurando transportador para Outlook/Hotmail');
    return nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  }

  // Configuración para desarrollo local (Gmail)
  if (process.env.NODE_ENV === 'development') {
    // Verificar si tenemos credenciales válidas
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Modo de prueba - no envía emails reales
      console.log('⚠️ Modo de prueba: No se configuraron credenciales de email');
      return null;
    }
  }

  // Configuración para producción (puedes usar SendGrid, AWS SES, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Sin configuración válida
  console.log('⚠️ No se configuraron credenciales de email válidas');
  return null;
};

// Enviar email de restablecimiento de contraseña
const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  try {
    const transporter = createTransporter();

    // Si no hay transportador configurado, simular envío exitoso
    if (!transporter) {
      console.log('📧 [MODO PRUEBA] Email de restablecimiento simulado:');
      console.log('   Para:', email);
      console.log('   Enlace:', resetUrl);
      console.log('   Usuario:', userName);
      console.log('   ⚠️ Para envío real, configura las variables de email');
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tuapp.com',
      to: email,
      subject: 'Restablecimiento de Contraseña',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecimiento de Contraseña</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 64px;
              height: 64px;
              background: #000;
              border-radius: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            .logo-letter {
              color: white;
              font-size: 32px;
              font-weight: bold;
              font-family: Georgia, serif;
            }
            .title {
              color: #333;
              font-size: 24px;
              font-weight: 600;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #666;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: #000;
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
            }
            .button:hover {
              background: #333;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #856404;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 14px;
            }
            .url {
              word-break: break-all;
              background: #f8f9fa;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 12px;
              color: #666;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="logo-letter">A</span>
              </div>
              <h1 class="title">Restablecimiento de Contraseña</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hola ${userName || 'Usuario'},</p>
              
              <p class="message">
                Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Restablecer Contraseña
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expira en 1 hora por seguridad.
              </div>
              
              <p class="message">
                Si no solicitaste este restablecimiento, puedes ignorar este email. Tu contraseña actual permanecerá sin cambios.
              </p>
              
              <p class="message">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              
              <div class="url">${resetUrl}</div>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, no respondas a este mensaje.</p>
              <p>Si tienes problemas, contacta al soporte técnico.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email de restablecimiento enviado exitosamente:', info.messageId);
    console.log('   Para:', email);
    console.log('   Usuario:', userName);
    console.log('   Enlace:', resetUrl);
    
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de restablecimiento:', error);
    throw error;
  }
};

// Enviar email de confirmación de cambio de contraseña
const sendPasswordChangedEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    // Si no hay transportador configurado, simular envío exitoso
    if (!transporter) {
      console.log('📧 [MODO PRUEBA] Email de confirmación simulado:');
      console.log('   Para:', email);
      console.log('   Usuario:', userName);
      console.log('   ⚠️ Para envío real, configura las variables de email');
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tuapp.com',
      to: email,
      subject: 'Contraseña Cambiada Exitosamente',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contraseña Cambiada</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 64px;
              height: 64px;
              background: #28a745;
              border-radius: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            .logo-letter {
              color: white;
              font-size: 32px;
              font-weight: bold;
              font-family: Georgia, serif;
            }
            .title {
              color: #28a745;
              font-size: 24px;
              font-weight: 600;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            .success {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #155724;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="logo-letter">A</span>
              </div>
              <h1 class="title">Contraseña Cambiada Exitosamente</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hola ${userName || 'Usuario'},</p>
              
              <div class="success">
                <strong>✅ Confirmado:</strong> Tu contraseña ha sido cambiada exitosamente.
              </div>
              
              <p class="message">
                Tu cuenta ahora está protegida con la nueva contraseña que elegiste.
              </p>
              
              <p class="message">
                Si no realizaste este cambio, contacta inmediatamente al soporte técnico.
              </p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, no respondas a este mensaje.</p>
              <p>Gracias por usar nuestra plataforma.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email de confirmación enviado exitosamente:', info.messageId);
    console.log('   Para:', email);
    console.log('   Usuario:', userName);
    
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};
