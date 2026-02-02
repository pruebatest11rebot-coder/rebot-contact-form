/**
 * Validators for contact form
 */

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate and normalize Chilean phone number to E.164 format
 * Accepts: +569XXXXXXXX, 569XXXXXXXX, 9XXXXXXXX, 09XXXXXXXX
 * Returns: +569XXXXXXXX or null if invalid
 */
function normalizeChileanPhone(phone) {
    if (!phone) return null;

    // Remove spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove leading + if present
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }

    // Handle different formats
    if (cleaned.startsWith('569') && cleaned.length === 11) {
        // Already in 569XXXXXXXX format
        return '+' + cleaned;
    } else if (cleaned.startsWith('9') && cleaned.length === 9) {
        // 9XXXXXXXX format
        return '+56' + cleaned;
    } else if (cleaned.startsWith('09') && cleaned.length === 10) {
        // 09XXXXXXXX format
        return '+56' + cleaned.substring(1);
    }

    return null; // Invalid format
}

/**
 * Validate file upload
 */
function validateFile(file) {
    const errors = [];

    if (!file) return { valid: true, errors: [] };

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        errors.push('El archivo no puede superar 10MB');
    }

    // Check file type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    if (!allowedTypes.includes(file.mimetype || file.type)) {
        errors.push('Solo se permiten archivos JPG, PNG, WebP o PDF');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize string input (prevent XSS)
 */
function sanitizeString(str) {
    if (!str) return '';
    return str
        .toString()
        .trim()
        .replace(/[<>]/g, ''); // Remove < and > to prevent basic XSS
}

/**
 * Validate required fields
 */
function validateFormData(data) {
    const errors = {};

    // Nombre (required)
    if (!data.nombre || data.nombre.trim().length === 0) {
        errors.nombre = 'El nombre es obligatorio';
    }

    // Descripción (required, min 20 chars)
    if (!data.descripcion || data.descripcion.trim().length < 20) {
        errors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    // Canal preferido (required)
    if (!data.canal_preferido || !['email', 'whatsapp'].includes(data.canal_preferido)) {
        errors.canal_preferido = 'Debe seleccionar un canal de contacto válido';
    }

    // Si canal es email, email es requerido y debe ser válido
    if (data.canal_preferido === 'email') {
        if (!data.email || !validateEmail(data.email)) {
            errors.email = 'Debe proporcionar un email válido';
        }
    }

    // Si canal es whatsapp, teléfono es requerido y debe ser válido
    if (data.canal_preferido === 'whatsapp') {
        const normalized = normalizeChileanPhone(data.telefono_whatsapp);
        if (!normalized) {
            errors.telefono_whatsapp = 'Debe proporcionar un número de WhatsApp válido (ej: +569XXXXXXXX)';
        }
    }

    // Acepta política (required, must be true)
    if (data.acepta_politica !== true && data.acepta_politica !== 'true') {
        errors.acepta_politica = 'Debe aceptar la política de privacidad';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

module.exports = {
    validateEmail,
    normalizeChileanPhone,
    validateFile,
    sanitizeString,
    validateFormData
};
