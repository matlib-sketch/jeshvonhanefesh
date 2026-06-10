# Cheshbon HaNefesh | חשבון הנפש

PWA de práctica diaria de auto-evaluación espiritual basada en el sistema de **R. Mendel de Satanov** (*Cheshbon HaNefesh*, 1808) — adaptación judía de las 13 virtudes de Benjamin Franklin.

## Funcionalidades

- **Hoy**: evaluá las 13 middot con puntuación −2 a +2 y escribí en tu diario
- **Historial**: calendario mensual con colores por promedio diario
- **Progreso**: gráficos de evolución y estadísticas de racha/adherencia
- **Objetivos**: seguimiento de metas semanales y mensuales
- **Configuración**: idioma (es/en/he), tema claro/oscuro, export/import JSON
- Funciona **100% offline** tras la primera carga (PWA)
- Datos 100% locales en el navegador (IndexedDB — sin backend)

## Desarrollo local

```bash
npm install
npm run dev
```

La app corre en `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

El resultado queda en `dist/`. Para previsualizar localmente:

```bash
npm run preview
```

## Deploy en Railway

1. Crear un nuevo proyecto en [railway.app](https://railway.app)
2. Conectar este repositorio de GitHub
3. Railway detecta `railway.json` automáticamente
4. Variables necesarias: ninguna (app 100% cliente)
5. Build command: `npm run build` | Start command: `npm start`

## Deploy en Vercel / Netlify

- **Vercel**: conectar el repo, framework = Vite, output = `dist`
- **Netlify**: build command `npm run build`, publish directory `dist`

Ambos funcionan sin configuración extra.

## App nativa (Capacitor)

El proyecto incluye un proyecto Android nativo en `android/`, generado con [Capacitor](https://capacitorjs.com). La misma base de código web se empaqueta como app instalable, con splash screen nativo y **recordatorio diario por notificación** (configurable en Ajustes → Recordatorio).

### Compilar para Android

Requisitos: [Android Studio](https://developer.android.com/studio) (incluye el SDK).

```bash
# 1. Configurar la URL del backend desplegado (la app nativa no tiene servidor propio)
cp .env.example .env
# Editar .env: VITE_API_URL=https://tu-backend.up.railway.app

# 2. Compilar la web y sincronizar con el proyecto nativo
npm run build
npx cap sync android

# 3. Abrir en Android Studio (o compilar por línea de comandos)
npx cap open android          # abre Android Studio → Run ▶
# — o bien —
cd android && ./gradlew assembleDebug   # genera el APK en app/build/outputs/apk/debug/
```

Para publicar en Google Play: generar un `.aab` firmado con `./gradlew bundleRelease` (ver [docs de firma](https://developer.android.com/studio/publish/app-signing)) y subirlo a la [Play Console](https://play.google.com/console) (cuenta de desarrollador: USD 25, pago único).

### iOS (pendiente)

Requiere una Mac con Xcode (o un servicio de build en la nube como Codemagic):

```bash
npm install @capacitor/ios
npx cap add ios
npx cap open ios
```

Antes de publicar en iOS conviene migrar el almacenamiento de IndexedDB a SQLite nativo (`@capacitor-community/sqlite`), porque WKWebView puede purgar IndexedDB ante presión de espacio.

### Regenerar íconos y splash

Los recursos nativos se generan desde `assets/` con:

```bash
npx @capacitor/assets generate --android \
  --iconBackgroundColor '#1e3a5f' --iconBackgroundColorDark '#1e3a5f' \
  --splashBackgroundColor '#f5f0e8' --splashBackgroundColorDark '#0d0b07'
```

## Instalar como PWA

**iPhone (Safari):**
1. Abrí la URL en Safari
2. Tocá el botón de compartir → "Agregar a pantalla de inicio"

**Android (Chrome):**
1. Abrí la URL en Chrome
2. Tocá el menú ⋮ → "Instalar app" o "Agregar a pantalla de inicio"

## Arquitectura

```
src/
  core/          # Lógica portable (sin DOM ni web APIs)
    domain/      # Tipos TypeScript + constante de las 13 middot
    storage/     # Dexie.js (IndexedDB): entradas, objetivos, configuración
    stores/      # Zustand stores
    utils/       # Funciones puras de cálculo de ciclos
  web/           # Específico de web (i18n)
  components/    # UI con Tailwind
  pages/         # Rutas de la app
  locales/       # Traducciones es/en/he
```

La carpeta `/core` no importa nada de `react-dom`, `window` ni APIs de browser — está diseñada para ser portable a React Native en v2.

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand |
| Base de datos | Dexie.js (IndexedDB) |
| Routing | React Router v7 |
| Gráficos | Recharts |
| Fechas | date-fns + @hebcal/core |
| PWA | vite-plugin-pwa |
| App nativa | Capacitor (Android) |
| i18n | react-i18next |
