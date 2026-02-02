# 🎨 Instrucciones para el Logo

## 📍 Ubicación del Logo

Coloca tu archivo de logo aquí:
```
assets/images/logo.webp
```

## 📏 Especificaciones Recomendadas

### Tamaño:
- **Ancho:** 200-400 píxeles
- **Alto:** Proporcional (el sitio ajusta automáticamente)
- **Formato:** .webp (optimizado para web)

### Alternativas Aceptadas:
Si no tienes .webp, también puedes usar:
- `logo.png` (con fondo transparente)
- `logo.svg` (vectorial, ideal para logos)

## 🔧 Cómo Cambiar el Formato

Si tu logo es PNG o SVG en lugar de WEBP:

### Opción 1: Convertir a WEBP (Recomendado)
Usa una herramienta online:
- https://cloudconvert.com/png-to-webp
- https://convertio.co/es/png-webp/

### Opción 2: Usar PNG o SVG Directamente

Edita `index.html` (línea ~81):
```html
<!-- Cambiar de: -->
<img src="assets/images/logo.webp" alt="Rebot Logo" class="h-12 w-auto">

<!-- A: -->
<img src="assets/images/logo.png" alt="Rebot Logo" class="h-12 w-auto">
<!-- O -->
<img src="assets/images/logo.svg" alt="Rebot Logo" class="h-12 w-auto">
```

También actualiza en:
- `servicios/robotica-industrial.html` (línea ~47)
- `servicios/_PLANTILLA.html` (línea ~47)

## 🎨 Ajustar Tamaño del Logo

El logo usa la clase `h-12` que significa altura de 48px.

Para cambiar el tamaño:

### Logo más grande:
```html
<img src="assets/images/logo.webp" alt="Rebot Logo" class="h-16 w-auto">
<!-- h-16 = 64px -->
```

### Logo más pequeño:
```html
<img src="assets/images/logo.webp" alt="Rebot Logo" class="h-8 w-auto">
<!-- h-8 = 32px -->
```

### Tamaños disponibles:
- `h-6` = 24px (muy pequeño)
- `h-8` = 32px (pequeño)
- `h-10` = 40px (mediano-pequeño)
- `h-12` = 48px (mediano) ← **ACTUAL**
- `h-14` = 56px (mediano-grande)
- `h-16` = 64px (grande)
- `h-20` = 80px (muy grande)

## 🎯 Dónde se Usa el Logo

El logo aparece en:

1. **Navegación principal** (`index.html`)
   - Esquina superior izquierda
   - Visible en todas las secciones

2. **Páginas de servicios** (`servicios/*.html`)
   - Esquina superior izquierda
   - Más pequeño (h-10) para ahorrar espacio

## 💡 Consejos

### Para Logos Oscuros:
Si tu logo es oscuro y no se ve bien en el fondo glass, puedes:

1. **Agregar un fondo blanco:**
```html
<img src="assets/images/logo.webp" alt="Rebot Logo" class="h-12 w-auto bg-white rounded-lg p-2">
```

2. **Usar versión invertida:**
Crea dos versiones del logo:
- `logo-light.webp` (para fondos oscuros)
- `logo-dark.webp` (para fondos claros)

### Para Logos con Texto:
Si tu logo incluye el nombre "Rebot", asegúrate de que sea legible a 48px de altura.

### Optimización:
- Comprime tu imagen para carga rápida
- Usa https://tinypng.com/ o https://squoosh.app/

## ✅ Checklist

- [ ] Logo colocado en `assets/images/logo.webp`
- [ ] Tamaño adecuado (200-400px de ancho)
- [ ] Fondo transparente (si es PNG/WEBP)
- [ ] Probado en navegador
- [ ] Se ve bien en móvil y desktop
- [ ] Carga rápidamente

## 🔍 Verificar

Después de colocar tu logo:
1. Abre http://localhost:8000
2. Verifica que el logo se vea correctamente
3. Prueba hacer clic en el logo (debe volver al inicio)
4. Revisa en móvil (responsive)

## 🆘 Problemas Comunes

**El logo no aparece:**
- Verifica que el archivo esté en la ruta correcta
- Verifica que el nombre sea exactamente `logo.webp`
- Revisa la consola del navegador (F12) para errores

**El logo se ve pixelado:**
- Usa una imagen de mayor resolución
- Considera usar formato SVG

**El logo es muy grande/pequeño:**
- Ajusta la clase `h-12` a otro valor (ver arriba)
