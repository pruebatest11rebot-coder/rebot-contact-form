# 📬 Formulario de Contacto - Rebot

Sistema completo de formulario de contacto con CRM integrado en Google Sheets, almacenamiento de archivos en Google Drive, notificaciones por email y confirmaciones por WhatsApp.

## ✨ Características

- ✅ **Formulario responsive** con validación en tiempo real
- ✅ **Google Sheets** como CRM (guardado automático de leads)
- ✅ **Google Drive** para almacenar archivos adjuntos
- ✅ **Email notifications** (interno y confirmación al usuario)
- ✅ **WhatsApp** confirmaciones automáticas
- ✅ **Rate limiting** anti-spam (3 envíos por IP cada 10 min)
- ✅ **Honeypot** anti-bots
- ✅ **UTM tracking** automático
- ✅ **Zona horaria** Chile (America/Santiago)
- ✅ **100% Gratuito** con límites generosos

## 🚀 Stack Tecnológico

### Backend
- **Vercel Serverless Functions** (Node.js 18+)
- **Google Sheets API** (CRM)
- **Google Drive API** (almacenamiento)
- **Nodemailer** (SMTP emails)
- **Meta WhatsApp Cloud API** o **Twilio** (mensajes)

### Frontend
- **HTML5 / CSS3 / JavaScript** (Vanilla, sin frameworks)
- **Responsive design**
- **Modern UI** con gradientes y animaciones

## 📁 Estructura de Archivos

```
d:/pagina_rebot/v5/
├── api/
│   └── contact.js              # Serverless function principal
├── lib/
│   ├── google-sheets.js        # Integración Google Sheets
│   ├── google-drive.js         # Integración Google Drive
│   ├── email-service.js        # Servicio de email
│   ├── whatsapp-service.js     # Servicio WhatsApp
│   ├── validators.js           # Validaciones
│   └── rate-limiter.js         # Rate limiting
├── pagina/
│   ├── contacto.html           # Formulario
│   ├── css/
│   │   └── contacto.css        # Estilos
│   └── js/
│       └── contacto.js         # Lógica frontend
├── .env.example                # Template variables entorno
├── .gitignore                  # Git ignore
├── package.json                # Dependencies
├── vercel.json                 # Config Vercel
├── SETUP.md                    # 📘 Guía completa de configuración
└── README.md                   # Este archivo
```

## 📋 Campos del Formulario

| Campo | Tipo | Required | Validación |
|-------|------|----------|------------|
| `nombre` | text | ✅ | No vacío |
| `empresa` | text | ❌ | - |
| `email` | email | ⚠️ | Si canal = email |
| `telefono_whatsapp` | tel | ⚠️ | Si canal = whatsapp, formato E.164 |
| `canal_preferido` | radio | ✅ | email \| whatsapp |
| `servicio_interes` | select | ❌ | - |
| `cantidad` | number | ❌ | Min 1 |
| `fecha_requerida` | date | ❌ | - |
| `descripcion` | textarea | ✅ | Min 20 caracteres |
| `acepta_politica` | checkbox | ✅ | Debe ser true |
| `archivo_imagen` | file | ❌ | JPG/PNG/WebP/PDF, max 10MB |

**Campos auto-capturados:**
- `utm_source`, `utm_medium`, `utm_campaign` (de URL)
- `pagina_origen` (URL actual)
- `user_agent` (navegador)
- `ip` (dirección IP)

## 🔧 Instalación y Configuración

### 1. Instalar dependencias

```bash
cd d:/pagina_rebot/v5
npm install
```

### 2. Configurar variables de entorno

Ver [SETUP.md](./SETUP.md) para guía completa paso a paso.

Copia `.env.example` a `.env` y configura:

```bash
copy .env.example .env
```

### 3. Configurar Google Cloud

1. Crear proyecto en Google Cloud
2. Habilitar APIs: Sheets + Drive
3. Crear Service Account y descargar JSON
4. Compartir Sheet y carpeta Drive con service account

Ver [SETUP.md](./SETUP.md) sección 1-3.

### 4. Configurar SMTP

Opciones:
- **Gmail** (gratis, 500/día) - recomendado
- **SendGrid** (100/día gratis)
- **Brevo** (300/día gratis)

Ver [SETUP.md](./SETUP.md) sección 4.

### 5. Configurar WhatsApp (opcional)

Opciones:
- **Meta Cloud API** (gratis, 1,000 conversaciones/mes) - recomendado
- **Twilio** (~$0.005/mensaje)

Ver [SETUP.md](./SETUP.md) sección 5.

### 6. Test local

```bash
npm run dev
```

Abre: `http://localhost:3000/pagina/contacto.html`

### 7. Deploy a Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Configura variables de entorno en Vercel Dashboard.

Ver [SETUP.md](./SETUP.md) sección 7.

## 🎯 Flujo de Funcionamiento

1. Usuario completa formulario
2. Frontend valida campos
3. Envía a `/api/contact` (serverless function)
4. Backend:
   - Valida datos
   - Verifica rate limit y honeypot
   - Sube archivo a Google Drive (si existe)
   - Inserta fila en Google Sheet ✅ (crítico)
   - Envía email interno a Contacto@rebot.cl
   - Envía confirmación al usuario (email o WhatsApp)
5. Retorna success/error al frontend

**Prioridad**: Si Google Sheet falla → error al usuario. Si email/WhatsApp fallan → success (se logea en Sheet).

## 📊 Google Sheet - Estructura

Columnas automáticas en pestaña "Leads":

1. ID
2. Fecha/Hora (Chile)
3. Nombre
4. Empresa
5. Email
6. WhatsApp
7. Canal preferido
8. Servicio interés
9. Cantidad
10. Fecha requerida
11. Descripción
12. Archivo (link)
13. Archivo (nombre)
14. Página origen
15. UTM Source
16. UTM Medium
17. UTM Campaign
18. IP
19. User Agent
20. Estado
21. Notas internas

## 🔒 Seguridad

- ✅ Validación en frontend y backend
- ✅ Rate limiting (3 envíos/IP cada 10 min)
- ✅ Honeypot anti-bots
- ✅ Sanitización de inputs
- ✅ Service Account (credenciales seguras)
- ✅ Variables de entorno (no expuestas)
- ✅ File upload con límites estrictos
- ✅ CORS configurado

## 💰 Costos

Con uso moderado (< 100 formularios/día):

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Free | **$0** |
| Google Sheets/Drive | Free | **$0** |
| Gmail SMTP | Free | **$0** |
| Meta WhatsApp | Free | **$0** |
| **TOTAL** | | **$0/mes** 🎉 |

Límites:
- Vercel: 100 GB bandwidth, 100 invocations/hora
- Gmail: 500 emails/día
- Meta WhatsApp: 1,000 conversaciones/mes

## 📚 Documentación

- **[SETUP.md](./SETUP.md)** - Guía completa de configuración paso a paso
- **[.env.example](./.env.example)** - Template de variables de entorno

## 🐛 Troubleshooting

Ver [SETUP.md](./SETUP.md) sección 9.

Problemas comunes:
- Error Google Sheet → verificar permisos del service account
- Error email → verificar credenciales SMTP
- Error WhatsApp → verificar tokens y formato de número
- Rate limit → verificar `RATE_LIMIT_MAX` en .env

## 📞 Soporte

- **Email**: contacto@rebot.cl
- **Web**: https://rebot.cl

---

**Desarrollado por Rebot** 🤖
