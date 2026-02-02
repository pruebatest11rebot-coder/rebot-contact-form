/**
 * Google Sheets integration for lead management
 */

const { google } = require('googleapis');

// Column headers for the Leads sheet
const HEADERS = [
    'ID',
    'Fecha/Hora',
    'Nombre',
    'Empresa',
    'Email',
    'WhatsApp',
    'Canal preferido',
    'Servicio interés',
    'Cantidad',
    'Fecha requerida',
    'Descripción',
    'Archivo (link)',
    'Archivo (nombre)',
    'Página origen',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'IP',
    'User Agent',
    'Estado',
    'Notas internas'
];

/**
 * Initialize Google Sheets client
 */
function getGoogleSheetsClient() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
}

/**
 * Ensure headers exist in the sheet
 */
async function ensureHeaders(sheets, spreadsheetId) {
    try {
        // Check if sheet has headers
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Leads!A1:U1'
        });

        const existingHeaders = response.data.values?.[0] || [];

        // If no headers or headers don't match, create them
        if (existingHeaders.length === 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Leads!A1:U1',
                valueInputOption: 'RAW',
                resource: {
                    values: [HEADERS]
                }
            });

            // Format header row (bold, freeze)
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1
                                },
                                cell: {
                                    userEnteredFormat: {
                                        textFormat: { bold: true },
                                        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                                    }
                                },
                                fields: 'userEnteredFormat(textFormat,backgroundColor)'
                            }
                        },
                        {
                            updateSheetProperties: {
                                properties: {
                                    sheetId: 0,
                                    gridProperties: {
                                        frozenRowCount: 1
                                    }
                                },
                                fields: 'gridProperties.frozenRowCount'
                            }
                        }
                    ]
                }
            });
        }
    } catch (error) {
        console.error('Error ensuring headers:', error.message);
        throw error;
    }
}

/**
 * Generate unique ID for lead
 */
function generateLeadId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LEAD-${timestamp}-${random}`;
}

/**
 * Format date/time in America/Santiago timezone
 */
function formatChileanDateTime() {
    const date = new Date();

    // Convert to Chilean timezone (UTC-3)
    const chileanDate = new Date(date.toLocaleString('en-US', {
        timeZone: 'America/Santiago'
    }));

    // Format as DD/MM/YYYY HH:mm:ss
    const day = String(chileanDate.getDate()).padStart(2, '0');
    const month = String(chileanDate.getMonth() + 1).padStart(2, '0');
    const year = chileanDate.getFullYear();
    const hours = String(chileanDate.getHours()).padStart(2, '0');
    const minutes = String(chileanDate.getMinutes()).padStart(2, '0');
    const seconds = String(chileanDate.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Insert lead into Google Sheet
 */
async function insertLead(leadData) {
    try {
        const sheets = getGoogleSheetsClient();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Ensure headers exist
        await ensureHeaders(sheets, spreadsheetId);

        // Generate ID and timestamp
        const id = generateLeadId();
        const dateTime = formatChileanDateTime();

        // Prepare row data matching header columns
        const rowData = [
            id,                                    // ID
            dateTime,                              // Fecha/Hora
            leadData.nombre || '',                 // Nombre
            leadData.empresa || '',                // Empresa
            leadData.email || '',                  // Email
            leadData.telefono_whatsapp || '',      // WhatsApp
            leadData.canal_preferido || '',        // Canal preferido
            leadData.servicio_interes || '',       // Servicio interés
            leadData.cantidad || '',               // Cantidad
            leadData.fecha_requerida || '',        // Fecha requerida
            leadData.descripcion || '',            // Descripción
            leadData.archivo_url || '',            // Archivo (link)
            leadData.archivo_nombre || '',         // Archivo (nombre)
            leadData.pagina_origen || '',          // Página origen
            leadData.utm_source || '',             // UTM Source
            leadData.utm_medium || '',             // UTM Medium
            leadData.utm_campaign || '',           // UTM Campaign
            leadData.ip || '',                     // IP
            leadData.user_agent || '',             // User Agent
            'Nuevo',                               // Estado
            leadData.notas_internas || ''          // Notas internas
        ];

        // Append row to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Leads!A:U',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [rowData]
            }
        });

        console.log(`✓ Lead inserted to Google Sheet: ${id}`);

        return {
            success: true,
            leadId: id,
            sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
        };

    } catch (error) {
        console.error('Error inserting lead to Google Sheet:', error.message);
        throw new Error(`Failed to save lead to Google Sheet: ${error.message}`);
    }
}

module.exports = {
    insertLead,
    generateLeadId,
    formatChileanDateTime
};
