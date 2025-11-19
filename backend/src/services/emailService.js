const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.SMTP_FROM || 'noreply@policia.gob.bo';
    this.initialized = false;
  }

  // Inicializar transportador de correo
  async initialize() {
    try {
      // Configuración SMTP
      const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

      // Si no hay credenciales, usar cuenta de prueba de Ethereal
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        logger.warn(
          'Credenciales SMTP no configuradas. Usando cuenta de prueba.'
        );
        const testAccount = await nodemailer.createTestAccount();

        config.host = 'smtp.ethereal.email';
        config.port = 587;
        config.secure = false;
        config.auth = {
          user: testAccount.user,
          pass: testAccount.pass,
        };

        this.from = testAccount.user;
      }

      this.transporter = nodemailer.createTransport(config);

      // Verificar conexión
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Servicio de email inicializado correctamente');
    } catch (error) {
      logger.error('Error al inicializar servicio de email:', error);
      this.initialized = false;
    }
  }

  // Enviar email genérico
  async enviarEmail({ to, subject, html, text, attachments = [] }) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.transporter) {
        throw new Error('Transportador de email no inicializado');
      }

      const mailOptions = {
        from: this.from,
        to,
        subject,
        text,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email enviado: ${info.messageId}`);

      // Si es cuenta de prueba, obtener URL de preview
      if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER) {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      logger.error('Error al enviar email:', error);
      throw error;
    }
  }

  // Email de bienvenida para nuevo personal
  async enviarBienvenida({ email, nombre, usuario, passwordTemporal }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .credentials { background: white; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>POLICÍA BOLIVIANA</h1>
            <h2>Departamento de Inteligencia Criminal D-2</h2>
          </div>
          <div class="content">
            <h2>Bienvenido/a al Sistema SIGEPIC</h2>
            <p>Estimado/a <strong>${nombre}</strong>,</p>
            <p>Se ha creado una cuenta para usted en el Sistema de Gestión del Personal de Inteligencia Criminal (SIGEPIC).</p>
            
            <div class="credentials">
              <h3>Credenciales de Acceso:</h3>
              <p><strong>Usuario:</strong> ${usuario}</p>
              <p><strong>Contraseña Temporal:</strong> ${passwordTemporal}</p>
              <p><strong>URL del Sistema:</strong> ${
                process.env.APP_URL || 'http://localhost:5173'
              }</p>
            </div>

            <div class="warning">
              <strong>⚠️ IMPORTANTE:</strong> Por su seguridad, debe cambiar su contraseña temporal en el primer inicio de sesión.
            </div>

            <h3>Primeros Pasos:</h3>
            <ol>
              <li>Acceda al sistema usando las credenciales proporcionadas</li>
              <li>Cambie su contraseña temporal por una nueva y segura</li>
              <li>Complete su perfil con información adicional si es necesario</li>
            </ol>

            <p>Si tiene alguna duda o problema, contacte con el administrador del sistema.</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; 2024 Policía Boliviana - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: 'Bienvenido al Sistema SIGEPIC',
      html,
      text: `Bienvenido ${nombre}. Usuario: ${usuario}, Contraseña: ${passwordTemporal}`,
    });
  }

  // Email de notificación de cambio de contraseña
  async enviarCambioPassword({ email, nombre }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Cambio de Contraseña Exitoso</h2>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${nombre}</strong>,</p>
            <p>Le confirmamos que su contraseña ha sido cambiada exitosamente.</p>
            <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString(
              'es-BO'
            )}</p>
            <p>Si usted no realizó este cambio, contacte inmediatamente con el administrador del sistema.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Policía Boliviana - SIGEPIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: 'Confirmación de Cambio de Contraseña - SIGEPIC',
      html,
      text: `Su contraseña ha sido cambiada exitosamente el ${new Date().toLocaleString(
        'es-BO'
      )}`,
    });
  }

  // Email de notificación de cambios en el registro
  async enviarNotificacionCambio({ email, nombre, cambios, entidad }) {
    const cambiosHtml = Object.entries(cambios)
      .map(
        ([campo, valores]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${campo}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${
            valores.anterior || 'N/A'
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${
            valores.nuevo || 'N/A'
          }</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #1e3a8a; color: white; padding: 10px; text-align: left; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Notificación de Cambios en su Registro</h2>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${nombre}</strong>,</p>
            <p>Le informamos que se han realizado cambios en su registro de ${entidad}:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor Anterior</th>
                  <th>Nuevo Valor</th>
                </tr>
              </thead>
              <tbody>
                ${cambiosHtml}
              </tbody>
            </table>

            <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString(
              'es-BO'
            )}</p>
            <p>Si tiene alguna duda sobre estos cambios, contacte con su supervisor.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Policía Boliviana - SIGEPIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `Notificación de Cambios - ${entidad}`,
      html,
      text: `Se han realizado cambios en su registro de ${entidad}`,
    });
  }

  // Email con reporte adjunto
  async enviarReporte({ email, nombre, nombreReporte, filePath }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Reporte SIGEPIC</h2>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${nombre}</strong>,</p>
            <p>Adjunto encontrará el reporte solicitado: <strong>${nombreReporte}</strong></p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString(
              'es-BO'
            )}</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Policía Boliviana - SIGEPIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `Reporte: ${nombreReporte}`,
      html,
      text: `Adjunto encontrará el reporte ${nombreReporte}`,
      attachments: [
        {
          filename: nombreReporte,
          path: filePath,
        },
      ],
    });
  }
}

module.exports = new EmailService();
