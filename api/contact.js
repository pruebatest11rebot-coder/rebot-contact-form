/**
 * Vercel Serverless Function - Contact Form Handler
 * Handles form submissions with file uploads and integrates with:
 * - Google Sheets (CRM)
 * - Google Drive (file storage)
 * - Email (notifications)
 * - WhatsApp (confirmations)
 */

const formidable = require('formidable');
const { validateFormData, validateFile, normalizeChileanPhone, sanitizeString } = require('../lib/validators');
const { isRateLimited, getClientIP } = require('../lib/rate-limiter');
const { insertLead } = require('../lib/google-sheets');
const { uploadFile } = require('../lib/google-drive');
const { sendInternalEmail, sendUserConfirmation } = require('../lib/email-service');
const { sendWhatsAppConfirmation } = require('../lib/whatsapp-service');

/**
 * Parse multipart form data
 */
function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB
            keepExtensions: true,
            allowEmptyFiles: false
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }

            // Convert fields (which may be arrays) to single values
            const flatFields = {};
            for (const [key, value] of Object.entries(fields)) {
                flatFields[key] = Array.isArray(value) ? value[0] : value;
            }

            resolve({ fields: flatFields, files });
        });
    });
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Get client IP
        const clientIP = getClientIP(req);

        // Check rate limit
        const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX) || 3;
        const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 600000;

        if (isRateLimited(clientIP, rateLimitMax, rateLimitWindow)) {
            console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).json({
                success: false,
                error: 'Demasiadas solicitudes. Por favor intenta nuevamente en unos minutos.'
            });
        }

        // Parse form data
        const { fields, files } = await parseForm(req);

        // Check honeypot (anti-bot)
        const honeypotField = process.env.HONEYPOT_FIELD || 'website';
        if (fields[honeypotField]) {
            console.log(`⚠️ Honeypot triggered from IP: ${clientIP}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid submission'
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            nombre: sanitizeString(fields.nombre),
            empresa: sanitizeString(fields.empresa),
            email: sanitizeString(fields.email),
            telefono_whatsapp: sanitizeString(fields.telefono_whatsapp),
            canal_preferido: fields.canal_preferido,
            servicio_interes: sanitizeString(fields.servicio_interes),
            cantidad: fields.cantidad,
            fecha_requerida: fields.fecha_requerida,
            descripcion: sanitizeString(fields.descripcion),
            acepta_politica: fields.acepta_politica,
            utm_source: sanitizeString(fields.utm_source),
            utm_medium: sanitizeString(fields.utm_medium),
            utm_campaign: sanitizeString(fields.utm_campaign),
            pagina_origen: fields.pagina_origen,
            ip: clientIP,
            user_agent: req.headers['user-agent'] || ''
        };

        // Validate form data
        const validation = validateFormData(sanitizedData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Validación fallida',
                errors: validation.errors
            });
        }

        // Normalize phone if WhatsApp channel
        if (sanitizedData.canal_preferido === 'whatsapp') {
            const normalized = normalizeChileanPhone(sanitizedData.telefono_whatsapp);
            if (!normalized) {
                return res.status(400).json({
                    success: false,
                    error: 'Número de WhatsApp inválido'
                });
            }
            sanitizedData.telefono_whatsapp = normalized;
        }

        // Validate file if uploaded
        const uploadedFile = files.archivo_imagen ?
            (Array.isArray(files.archivo_imagen) ? files.archivo_imagen[0] : files.archivo_imagen) :
            null;

        if (uploadedFile) {
            const fileValidation = validateFile(uploadedFile);
            if (!fileValidation.valid) {
                return res.status(400).json({
                    success: false,
                    error: fileValidation.errors.join(', ')
                });
            }
        }

        // Upload file to Google Drive if present
        let fileData = null;
        let uploadError = null;

        if (uploadedFile) {
            try {
                const leadIdTemp = `TEMP-${Date.now()}`;
                fileData = await uploadFile(uploadedFile, leadIdTemp);
                sanitizedData.archivo_url = fileData.url;
                sanitizedData.archivo_nombre = fileData.fileName;
            } catch (error) {
                console.error('File upload error:', error.message);
                uploadError = error.message;
                // Continue without file - don't fail the entire submission
            }
        }

        // Insert lead to Google Sheet (CRITICAL - if this fails, return error)
        let sheetResult;
        try {
            sheetResult = await insertLead(sanitizedData);

            if (uploadError) {
                // Log file upload error in notes
                sanitizedData.notas_internas = `Error al subir archivo: ${uploadError}`;
            }

        } catch (error) {
            console.error('Sheet insert error:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Error al guardar la solicitud. Por favor intenta nuevamente.'
            });
        }

        // Send internal email notification (non-critical)
        let emailError = null;
        try {
            await sendInternalEmail(sanitizedData, sheetResult.sheetUrl);
        } catch (error) {
            console.error('Internal email error:', error.message);
            emailError = error.message;
            // Log in sheet notes but don't fail
        }

        // Send confirmation to user
        let confirmationError = null;

        if (sanitizedData.canal_preferido === 'email' && sanitizedData.email) {
            try {
                await sendUserConfirmation(sanitizedData);
            } catch (error) {
                console.error('User email error:', error.message);
                confirmationError = error.message;
            }
        } else if (sanitizedData.canal_preferido === 'whatsapp' && sanitizedData.telefono_whatsapp) {
            try {
                const whatsappResult = await sendWhatsAppConfirmation(sanitizedData);
                if (!whatsappResult.success && whatsappResult.fallback) {
                    confirmationError = 'WhatsApp pendiente de envío manual';
                }
            } catch (error) {
                console.error('WhatsApp error:', error.message);
                confirmationError = error.message;
            }
        }

        // Log any errors in sheet notes
        if (emailError || confirmationError) {
            const notesArray = [];
            if (emailError) notesArray.push(`Error email interno: ${emailError}`);
            if (confirmationError) notesArray.push(`Error confirmación: ${confirmationError}`);
            // Note: In production, you'd want to update the sheet row with these notes
            console.log('Errors logged:', notesArray.join(' | '));
        }

        // Return success (sheet save was successful)
        return res.status(200).json({
            success: true,
            message: '¡Solicitud recibida exitosamente! Te contactaremos pronto.',
            leadId: sheetResult.leadId
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error inesperado. Por favor intenta nuevamente.'
        });
    }
};
