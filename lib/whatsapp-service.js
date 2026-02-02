/**
 * WhatsApp service integration
 * Supports both Meta WhatsApp Cloud API (free) and Twilio (paid)
 */

/**
 * Send WhatsApp message using Meta WhatsApp Cloud API
 */
async function sendWhatsAppMeta(phoneNumber, message) {
    try {
        const token = process.env.META_WHATSAPP_TOKEN;
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_ID;

        if (!token || !phoneNumberId) {
            throw new Error('Meta WhatsApp credentials not configured');
        }

        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber.replace('+', ''),
                type: 'text',
                text: {
                    body: message
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Meta API error: ${JSON.stringify(data)}`);
        }

        console.log(`✓ WhatsApp message sent via Meta to ${phoneNumber}`);
        return { success: true, provider: 'meta' };

    } catch (error) {
        console.error('Error sending WhatsApp via Meta:', error.message);
        throw error;
    }
}

/**
 * Send WhatsApp message using Twilio
 */
async function sendWhatsAppTwilio(phoneNumber, message) {
    try {
        const twilio = require('twilio');

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials not configured');
        }

        const client = twilio(accountSid, authToken);

        await client.messages.create({
            body: message,
            from: fromNumber,
            to: `whatsapp:${phoneNumber}`
        });

        console.log(`✓ WhatsApp message sent via Twilio to ${phoneNumber}`);
        return { success: true, provider: 'twilio' };

    } catch (error) {
        console.error('Error sending WhatsApp via Twilio:', error.message);
        throw error;
    }
}

/**
 * Send WhatsApp confirmation to user
 */
async function sendWhatsAppConfirmation(leadData) {
    try {
        const provider = process.env.WHATSAPP_PROVIDER || 'meta';
        const phoneNumber = leadData.telefono_whatsapp;

        if (!phoneNumber) {
            throw new Error('No phone number provided');
        }

        // Generate personalized message
        const message = `Hola ${leadData.nombre}, recibimos tu solicitud sobre ${leadData.servicio_interes}. En breve te contactaremos. – Rebot`;

        // Send via configured provider
        if (provider === 'meta') {
            return await sendWhatsAppMeta(phoneNumber, message);
        } else if (provider === 'twilio') {
            return await sendWhatsAppTwilio(phoneNumber, message);
        } else {
            throw new Error(`Unknown WhatsApp provider: ${provider}`);
        }

    } catch (error) {
        console.error('Error sending WhatsApp confirmation:', error.message);
        return {
            success: false,
            error: error.message,
            fallback: true // Mark for manual follow-up
        };
    }
}

module.exports = {
    sendWhatsAppConfirmation
};
