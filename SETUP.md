# 📋 Guía de Configuración - Formulario de Contacto Rebot

Guía completa paso a paso para configurar y desplegar el formulario de contacto con todas las integraciones.

---

## 📦 Requisitos Previos

- **Node.js** 18+ instalado
- **Cuenta Google** para Sheets y Drive
- **Cuenta Vercel** (gratuita)
- **Cuenta SMTP** (Gmail/SendGrid/Brevo)
- **Cuenta WhatsApp** (Meta Cloud API o Twilio) - opcional

---

## 1️⃣ Configuración de Google Cloud

### 1.1 Crear Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Clic en "Select a project" → "New Project"
3. Nombre: `rebot-contact-form`
4. Clic en "Create"

### 1.2 Habilitar APIs

1. En el menú lateral: **APIs & Services** → **Library**
2. Busca y habilita:
   - **Google Sheets API**
   - **Google Drive API**

### 1.3 Crear Service Account

1. **APIs & Services** → **Credentials**
2. Clic en **Create Credentials** → **Service Account**
3. Nombre: `contact-form-service`
4. Role: **Editor** (o roles específicos: Sheets Editor, Drive File Creator)
5. Clic en **Done**

### 1.4 Generar JSON Key

1. En la lista de Service Accounts, clic en el email del service account creado
2. Pestaña **Keys** → **Add Key** → **Create new key**
3. Tipo: **JSON**
4. Descarga el archivo JSON (guárdalo de forma segura)

### 1.5 Copiar Email del Service Account

- Copia el email del service account: `contact-form-service@rebot-contact-form.iam.gserviceaccount.com`
- Lo necesitarás para compartir el Sheet y Drive

---

## 2️⃣ Configuración de Google Sheet

### 2.1 Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea un nuevo spreadsheet
3. Nómbralo: **Rebot - Leads CRM**
4. Crea una pestaña llamada: **Leads**
5. Copia el **Sheet ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```

### 2.2 Compartir Sheet con Service Account

1. Clic en **Share** (Compartir)
2. Pega el email del service account
3. Rol: **Editor**
4. Desmarca "Notify people"
5. Clic en **Share**

> **Nota**: Los encabezados se crearán automáticamente al recibir el primer lead

---

## 3️⃣ Configuración de Google Drive

### 3.1 Crear Carpeta

1. Ve a [Google Drive](https://drive.google.com/)
2. Crea una nueva carpeta: **Rebot/LeadsUploads**
3. Copia el **Folder ID** de la URL:
   ```
   https://drive.google.com/drive/folders/{FOLDER_ID}
   ```

### 3.2 Compartir Carpeta con Service Account

1. Click derecho en la carpeta → **Share**
2. Pega el email del service account
3. Rol: **Editor**
4. Desmarca "Notify people"
5. Clic en **Share**

---

## 4️⃣ Configuración de Email (SMTP)

Elige **UNA** de estas opciones:

### Opción A: Gmail (Recomendado, Gratis)

1. Ve a tu [Cuenta Google](https://myaccount.google.com/)
2. **Security** → **2-Step Verification** (habilítalo si no lo tienes)
3. Busca **App passwords**
4. Genera una nueva app password:
   - App: **Mail**
   - Device: **Other** (nombre: "Rebot Contact Form")
5. Copia la contraseña generada (16 caracteres)

**Variables de entorno:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App password
FROM_EMAIL=tu-email@gmail.com
INTERNAL_EMAIL=contacto@rebot.cl
```

### Opción B: SendGrid (100 emails/día gratis)

1. Crea cuenta en [SendGrid](https://sendgrid.com/)
2. **Settings** → **API Keys** → **Create API Key**
3. Nombre: "Rebot Contact"
4. Permisos: **Full Access** o **Mail Send**
5. Copia el API Key

**Variables de entorno:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=TU_API_KEY_AQUI
FROM_EMAIL=contacto@rebot.cl
INTERNAL_EMAIL=contacto@rebot.cl
```

### Opción C: Brevo (300 emails/día gratis)

1. Crea cuenta en [Brevo](https://www.brevo.com/)
2. **SMTP & API** → **SMTP**
3. Copia las credenciales

**Variables de entorno:**
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@rebot.cl
SMTP_PASS=TU_SMTP_KEY_AQUI
FROM_EMAIL=contacto@rebot.cl
INTERNAL_EMAIL=contacto@rebot.cl
```

---

## 5️⃣ Configuración de WhatsApp

Elige **UNA** de estas opciones:

### Opción A: Meta WhatsApp Cloud API (Gratis, Recomendado)

1. Ve a [Meta for Developers](https://developers.facebook.com/apps)
2. **Create App** → Tipo: **Business**
3. Agrega el producto: **WhatsApp**
4. **WhatsApp** → **Getting Started**
5. Copia:
   - **Access Token** (temporary o permanent)
   - **Phone Number ID**
   - **Business Account ID**

**Variables de entorno:**
```env
WHATSAPP_PROVIDER=meta
META_WHATSAPP_TOKEN=tu_access_token
META_WHATSAPP_PHONE_ID=tu_phone_id
META_WHATSAPP_BUSINESS_ID=tu_business_id
```

> **Nota**: Para producción necesitarás verificar tu número de WhatsApp Business

### Opción B: Twilio (Pago, ~$0.005/mensaje)

1. Crea cuenta en [Twilio](https://www.twilio.com/)
2. **Console** → **WhatsApp** → **Senders**
3. Configura un número WhatsApp
4. Copia:
   - Account SID
   - Auth Token
   - WhatsApp number

**Variables de entorno:**
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 6️⃣ Configuración Local

### 6.1 Instalar Dependencias

```bash
cd d:/pagina_rebot/v5
npm install
```

### 6.2 Configurar Variables de Entorno

1. Copia el archivo `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Edita `.env` con tus credenciales:

```env
# ============================================
# GOOGLE CLOUD CONFIGURATION
# ============================================

GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"..."}
GOOGLE_SHEET_ID=1abc...xyz
GOOGLE_DRIVE_FOLDER_ID=1def...uvw

# ============================================
# EMAIL CONFIGURATION
# ============================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=tu-email@gmail.com
INTERNAL_EMAIL=contacto@rebot.cl

# ============================================
# WHATSAPP CONFIGURATION
# ============================================

WHATSAPP_PROVIDER=meta
META_WHATSAPP_TOKEN=tu_token
META_WHATSAPP_PHONE_ID=tu_phone_id
META_WHATSAPP_BUSINESS_ID=tu_business_id

# ============================================
# SECURITY & RATE LIMITING
# ============================================

RATE_LIMIT_MAX=3
RATE_LIMIT_WINDOW_MS=600000
HONEYPOT_FIELD=website

# ============================================
# GENERAL SETTINGS
# ============================================

SITE_URL=https://rebot.cl
DEBUG_MODE=false
```

> **IMPORTANTE**: El JSON del Service Account debe estar en UNA SOLA LÍNEA

### 6.3 Test Local

```bash
npm run dev
```

Esto iniciará el servidor local en `http://localhost:3000`

Abre tu navegador y ve a:
```
http://localhost:3000/pagina/contacto.html
```

---

## 7️⃣ Deploy a Vercel

### 7.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 7.2 Login

```bash
vercel login
```

### 7.3 Deploy

```bash
cd d:/pagina_rebot/v5
vercel
```

Sigue las instrucciones:
- Set up and deploy? **Y**
- Which scope? (elige tu cuenta)
- Link to existing project? **N**
- Project name: `rebot-contact`
- Directory: `./`
- Override settings? **N**

### 7.4 Configurar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: **rebot-contact**
3. **Settings** → **Environment Variables**
4. Agrega TODAS las variables del archivo `.env`:

| Name | Value |
|------|-------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` |
| `GOOGLE_SHEET_ID` | `1abc...xyz` |
| `GOOGLE_DRIVE_FOLDER_ID` | `1def...uvw` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `tu-email@gmail.com` |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` |
| `FROM_EMAIL` | `tu-email@gmail.com` |
| `INTERNAL_EMAIL` | `contacto@rebot.cl` |
| `WHATSAPP_PROVIDER` | `meta` |
| `META_WHATSAPP_TOKEN` | `tu_token` |
| `META_WHATSAPP_PHONE_ID` | `tu_phone_id` |
| `META_WHATSAPP_BUSINESS_ID` | `tu_business_id` |
| `RATE_LIMIT_MAX` | `3` |
| `RATE_LIMIT_WINDOW_MS` | `600000` |
| `HONEYPOT_FIELD` | `website` |
| `SITE_URL` | `https://rebot.cl` |
| `DEBUG_MODE` | `false` |

5. Clic en **Save**

### 7.5 Redeploy

```bash
vercel --prod
```

Tu sitio estará disponible en:
```
https://rebot-contact.vercel.app
```

O tu dominio personalizado si lo configuraste.

---

## 8️⃣ Testing del Flujo Completo

### 8.1 Test Manual

1. Ve a: `https://tu-dominio.vercel.app/pagina/contacto.html`

2. **Test con Email**:
   - Llena el formulario
   - Selecciona canal: **Email**
   - Adjunta un archivo (opcional)
   - Envía

3. **Verificar**:
   - ✅ Registro en Google Sheet (pestaña Leads)
   - ✅ Archivo en Google Drive
   - ✅ Email recibido en `contacto@rebot.cl`
   - ✅ Email de confirmación al usuario

4. **Test con WhatsApp**:
   - Llena el formulario
   - Selecciona canal: **WhatsApp**
   - Ingresa tu número: `+569XXXXXXXX`
   - Envía

5. **Verificar**:
   - ✅ Registro en Google Sheet
   - ✅ Mensaje WhatsApp recibido

### 8.2 Test de Validación

- Intenta enviar sin nombre → debe mostrar error
- Intenta enviar con descripción < 20 chars → debe mostrar error
- Intenta enviar email sin seleccionar canal email → debe mostrar error
- Intenta enviar 4 veces seguidas → debe bloquear por rate limit

### 8.3 Test de Honeypot

- Abre consola de desarrollador (F12)
- Ejecuta:
  ```javascript
  document.getElementById('website').value = 'spam';
  ```
- Envía el formulario → debe rechazar

---

## 9️⃣ Mantenimiento

### Ver Logs

```bash
vercel logs
```

### Actualizar Código

1. Realiza cambios en tu código local
2. Deploy:
   ```bash
   vercel --prod
   ```

### Monitorear

- **Google Sheet**: Revisa nuevos leads
- **Vercel Dashboard**: Revisa analytics y logs
- **Email**: Verifica que lleguen las notificaciones

---

## 🔧 Troubleshooting

### Error: "Failed to save lead to Google Sheet"

- Verifica que el Sheet esté compartido con el service account
- Verifica que el SHEET_ID sea correcto
- Verifica que el JSON del service account sea válido

### Error: "Failed to upload file to Google Drive"

- Verifica que la carpeta esté compartida con el service account
- Verifica que el FOLDER_ID sea correcto

### Error: "Error sending email"

- Verifica credenciales SMTP
- Si usas Gmail, verifica que la App Password esté habilitada
- Verifica que el puerto 587 no esté bloqueado

### Error: "WhatsApp message failed"

- Verifica tokens de Meta/Twilio
- Verifica que el número esté en formato E.164 (+569XXXXXXXX)
- Para Meta: verifica que el número esté registrado en WhatsApp Business

### Rate limit muy estricto

- Aumenta `RATE_LIMIT_MAX` en las variables de entorno
- Aumenta `RATE_LIMIT_WINDOW_MS` para ventana de tiempo más larga

---

## 🎉 ¡Listo!

Tu formulario de contacto está completamente configurado y listo para recibir leads.

**URLs importantes:**
- Formulario: `https://tu-dominio.vercel.app/pagina/contacto.html`
- Google Sheet: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Google Drive: `https://drive.google.com/drive/folders/{FOLDER_ID}`

**Costos mensuales estimados (uso moderado):**
- Vercel: **$0** (free tier)
- Google Sheets/Drive: **$0**
- Gmail SMTP: **$0** (hasta 500/día)
- Meta WhatsApp: **$0** (hasta 1,000 conversaciones/mes)

**Total: $0/mes** 🎊
