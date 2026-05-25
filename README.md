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
| i18n | react-i18next |
