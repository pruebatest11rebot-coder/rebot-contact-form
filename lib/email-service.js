/**
 * Email service using Nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/**
 * Generate HTML email template for internal notification
 */
function generateInternalEmailHTML(leadData, sheetUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; padding: 12px; background: white; border-left: 4px solid #667eea; }
    .field-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
    .field-value { color: #555; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nuevo Contacto Web</h1>
      <p>Se ha recibido una nueva solicitud de contacto</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">📝 Servicio de Interés:</div>
        <div class="field-value"><strong>${leadData.servicio_interes}</strong></div>
      </div>
      
      <div class="field">
        <div class="field-label">👤 Nombre:</div>
        <div class="field-value">${leadData.nombre}</div>
      </div>
      
      ${leadData.empresa ? `
      <div class="field">
        <div class="field-label">🏢 Empresa:</div>
        <div class="field-value">${leadData.empresa}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">📞 Canal Preferido:</div>
        <div class="field-value">${leadData.canal_preferido === 'email' ? '📧 Email' : '💬 WhatsApp'}</div>
      </div>
      
      ${leadData.email ? `
      <div class="field">
        <div class="field-label">📧 Email:</div>
        <div class="field-value"><a href="mailto:${leadData.email}">${leadData.email}</a></div>
      </div>
      ` : ''}
      
      ${leadData.telefono_whatsapp ? `
      <div class="field">
        <div class="field-label">💬 WhatsApp:</div>
        <div class="field-value"><a href="https://wa.me/${leadData.telefono_whatsapp.replace('+', '')}">${leadData.telefono_whatsapp}</a></div>
      </div>
      ` : ''}
      
      ${leadData.cantidad ? `
      <div class="field">
        <div class="field-label">🔢 Cantidad:</div>
        <div class="field-value">${leadData.cantidad}</div>
      </div>
      ` : ''}
      
      ${leadData.fecha_requerida ? `
      <div class="field">
        <div class="field-label">📅 Fecha Requerida:</div>
        <div class="field-value">${leadData.fecha_requerida}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">📄 Descripción:</div>
        <div class="field-value">${leadData.descripcion.replace(/\n/g, '<br>')}</div>
      </div>
      
      ${leadData.archivo_url ? `
      <div class="field">
        <div class="field-label">📎 Archivo Adjunto:</div>
        <div class="field-value">
          <a href="${leadData.archivo_url}" target="_blank">${leadData.archivo_nombre}</a>
        </div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">🌐 Página de Origen:</div>
        <div class="field-value"><a href="${leadData.pagina_origen}">${leadData.pagina_origen}</a></div>
      </div>
      
      ${leadData.utm_source || leadData.utm_medium || leadData.utm_campaign ? `
      <div class="field">
        <div class="field-label">📊 UTM Tracking:</div>
        <div class="field-value">
          ${leadData.utm_source ? `Source: ${leadData.utm_source}<br>` : ''}
          ${leadData.utm_medium ? `Medium: ${leadData.utm_medium}<br>` : ''}
          ${leadData.utm_campaign ? `Campaign: ${leadData.utm_campaign}` : ''}
        </div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">🕒 Fecha/Hora:</div>
        <div class="field-value">${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${sheetUrl}" class="button">Ver en Google Sheet 📊</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Este email fue generado automáticamente por el formulario de contacto de Rebot</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email template for user confirmation
 */
function generateUserConfirmationHTML(leadData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
    h1 { margin: 0; font-size: 28px; }
    h2 { color: #667eea; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Solicitud Recibida</h1>
      <p>¡Gracias por contactarnos!</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${leadData.nombre}</strong>,</p>
      
      <p>Hemos recibido tu solicitud sobre <strong>${leadData.servicio_interes}</strong>. Nuestro equipo la revisará y te contactaremos pronto.</p>
      
      <div class="summary">
        <h2>📋 Resumen de tu solicitud</h2>
        <p><strong>Servicio:</strong> ${leadData.servicio_interes}</p>
        ${leadData.cantidad ? `<p><strong>Cantidad:</strong> ${leadData.cantidad}</p>` : ''}
        ${leadData.fecha_requerida ? `<p><strong>Fecha requerida:</strong> ${leadData.fecha_requerida}</p>` : ''}
        <p><strong>Descripción:</strong><br>${leadData.descripcion.replace(/\n/g, '<br>')}</p>
      </div>
      
      <h2>⏱️ Tiempos estimados de respuesta</h2>
      <p>Normalmente respondemos en un plazo de <strong>24 a 48 horas hábiles</strong>. Si tu solicitud es urgente, no dudes en contactarnos directamente.</p>
      
      <h2>📞 Datos de contacto</h2>
      <p>
        📧 Email: <a href="mailto:contacto@rebot.cl">contacto@rebot.cl</a><br>
        💬 WhatsApp: <a href="https://wa.me/56912345678">+56 9 1234 5678</a><br>
        🌐 Web: <a href="https://rebot.cl">www.rebot.cl</a>
      </p>
      
      <p style="margin-top: 30px;">
        <strong>Equipo Rebot</strong><br>
        <em>Innovación y Tecnología</em>
      </p>
    </div>
    
    <div class="footer">
      <p>Este es un mensaje automático, por favor no respondas a este email</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send internal notification email
 */
async function sendInternalEmail(leadData, sheetUrl) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Rebot Website" <${process.env.FROM_EMAIL}>`,
            to: process.env.INTERNAL_EMAIL,
            subject: `Nuevo contacto web – ${leadData.servicio_interes} – ${leadData.nombre}`,
            html: generateInternalEmailHTML(leadData, sheetUrl)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ Internal email sent to ${process.env.INTERNAL_EMAIL}`);

        return { success: true };

    } catch (error) {
        console.error('Error sending internal email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmation(leadData) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Rebot" <${process.env.FROM_EMAIL}>`,
            to: leadData.email,
            subject: 'Recibimos tu solicitud – Rebot',
            html: generateUserConfirmationHTML(leadData)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ Confirmation email sent to ${leadData.email}`);

        return { success: true };

    } catch (error) {
        console.error('Error sending confirmation email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    sendInternalEmail,
    sendUserConfirmation
};
