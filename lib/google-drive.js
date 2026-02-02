/**
 * Google Drive integration for file uploads
 */

const { google } = require('googleapis');
const fs = require('fs');

/**
 * Initialize Google Drive client
 */
function getGoogleDriveClient() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return google.drive({ version: 'v3', auth });
}

/**
 * Upload file to Google Drive
 * @param {Object} file - File object from formidable
 * @param {string} leadId - Lead ID for organizing files
 * @returns {Object} - { url, fileName }
 */
async function uploadFile(file, leadId) {
    try {
        const drive = getGoogleDriveClient();
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        // Prepare file metadata
        const fileName = `${leadId}_${file.originalFilename || file.newFilename}`;

        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.filepath)
        };

        // Upload file
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });

        const fileId = response.data.id;

        // Make file publicly readable (anyone with link can view)
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Get shareable link
        const fileInfo = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink'
        });

        console.log(`✓ File uploaded to Google Drive: ${fileName}`);

        return {
            url: fileInfo.data.webViewLink,
            fileName: fileName,
            fileId: fileId
        };

    } catch (error) {
        console.error('Error uploading file to Google Drive:', error.message);
        throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
    }
}

module.exports = {
    uploadFile
};
