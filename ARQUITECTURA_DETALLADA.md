# 🏗️ ARQUITECTURA Y DIAGRAMA DEL SISTEMA

## Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────────┐
│                        FLASHBOOTH.AI                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              App.tsx (Raíz de la Aplicación)            │ │
│  │  - Estado global: photos[], stripCaption               │ │
│  │  - Scroll management                                    │ │
│  └──────────────────┬───────────────────────────────────────┘ │
│                     │                                          │
│         ┌───────────┴──────────────┐                          │
│         │                          │                          │
│         ▼                          ▼                          │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │  PhotoBooth.tsx  │      │  AIControls.tsx  │              │
│  │                  │      │                  │              │
│  │ • Cámara Web     │      │ • Caption Gen    │              │
│  │ • 5 fotos auto   │      │ • Vibe Analyze   │              │
│  │ • Countdown 3s   │      │ • Image Gen      │              │
│  │ • Canvas capture │      │ • Loading states │              │
│  │ • Flash effect   │      │ • Error handling │              │
│  │                  │      │                  │              │
│  └──────────────┬───┘      └──────────┬───────┘              │
│                 │                     │                      │
│                 └─────────┬───────────┘                       │
│                           │                                  │
│                           ▼                                  │
│                ┌──────────────────────┐                      │
│                │  PhotoStrip.tsx      │                      │
│                │                      │                      │
│                │ • Visualización      │                      │
│                │ • 6 Filtros CSS      │                      │
│                │ • Canvas rendering   │                      │
│                │ • Download individual│                      │
│                │ • Download strip     │                      │
│                │ • Social share       │                      │
│                │                      │                      │
│                └──────────┬───────────┘                      │
│                           │                                  │
│                           ▼                                  │
│                ┌──────────────────────┐                      │
│                │ geminiService.ts     │                      │
│                │                      │                      │
│                │ • Caption generation │                      │
│                │ • Photo analysis     │                      │
│                │ • Image generation   │                      │
│                │ • Error handling     │                      │
│                │                      │                      │
│                └──────────┬───────────┘                      │
│                           │                                  │
│                           ▼                                  │
│                ┌──────────────────────┐                      │
│                │   Gemini API         │                      │
│                │ (Google Cloud)       │                      │
│                │                      │                      │
│                │ • gemini-2.5-flash   │                      │
│                │ • gemini-2.5-pro     │                      │
│                │                      │                      │
│                └──────────────────────┘                      │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│   Usuario: Abre     │
│   Navegador         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   1. SOLICITUD DE PERMISOS              │
│   - getUserMedia() → Camera Permission  │
│   - Si rechaza: Error message           │
│   - Si acepta: Stream de video          │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   2. VIDEO STREAM EN VIVO                │
│   - HTMLVideoElement recibe stream      │
│   - Display en tiempo real              │
│   - Espejo (flip horizontal)            │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   3. CLICK "START PHOTO BOOTH"           │
│   - Inicia isSessionActive = true       │
│   - Loop de 5 iteraciones               │
└──────────┬──────────────────────────────┘
           │
           ├─ Para cada foto:
           │  │
           │  ├─ Countdown 3-2-1 (visual)
           │  │
           │  ├─ capturePhoto()
           │  │  ├─ Canvas.getContext('2d')
           │  │  ├─ DrawImage(video)
           │  │  ├─ toDataURL('image/jpeg', 0.9)
           │  │  └─ Photo objeto {id, dataUrl, timestamp}
           │  │
           │  ├─ Flash effect (300ms)
           │  │
           │  └─ Espera 1500ms
           │
           ▼
┌─────────────────────────────────────────┐
│   4. FOTOS CAPTURADAS [Array × 5]        │
│   - Almacenadas en estado React         │
│   - Formato: Data URL (Base64 JPEG)     │
│   - En memoria del navegador            │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   5. AUTO-SCROLL A RESULTADOS           │
│   - resultsRef.scrollIntoView()         │
│   - Smooth scroll 500ms delay           │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│   6. MOSTRAR PHOTO STRIP                │
│   - Display 5 fotos en grid vertical    │
│   - Aplicar filtro (default: normal)    │
│   - Overlay individual download         │
└──────────┬──────────────────────────────┘
           │
           ├─ OPCIÓN A: AI FEATURES
           │  │
           │  ├─ Click "Generate Caption"
           │  │  ├─ API Call: Gemini 2.5 Flash
           │  │  ├─ Input: numPhotos
           │  │  ├─ Output: caption string
           │  │  └─ Mostrar en strip
           │  │
           │  ├─ Click "Analyze Vibe"
           │  │  ├─ API Call: Gemini 2.5 Pro (Vision)
           │  │  ├─ Input: photo[0] (base64)
           │  │  ├─ Output: analysis text
           │  │  └─ Display en card
           │  │
           │  └─ Click "Generate Asset"
           │     ├─ API Call: Gemini 2.5 Pro (Image Gen)
           │     ├─ Input: prompt + aspectRatio
           │     ├─ Output: image (base64 PNG)
           │     └─ Display en preview
           │
           └─ OPCIÓN B: DESCARGA / COMPARTIR
              │
              ├─ Click "Save Strip"
              │  ├─ generateStripCanvas()
              │  │  ├─ Canvas 680×2650px
              │  │  ├─ Dibuja header, fotos, caption
              │  │  ├─ Aplica filtros
              │  │  └─ toDataURL('image/jpeg', 0.9)
              │  │
              │  ├─ Crea link <a> descarga
              │  ├─ link.download = "gemini-strip-{TS}.jpg"
              │  ├─ link.click()
              │  └─ Descarga a local
              │
              ├─ Click ícono descarga individual
              │  ├─ Canvas render con filtro
              │  ├─ toDataURL('image/jpeg', 0.9)
              │  ├─ Trigger descarga
              │  └─ Archivo: "photo-{UUID}.jpg"
              │
              ├─ Click "Share"
              │  ├─ Web Share API si disponible
              │  └─ O fallback social links
              │
              ├─ Click Twitter
              │  └─ Abre twitter.com/intent/tweet
              │
              ├─ Click Facebook
              │  └─ Abre facebook.com/sharer
              │
              └─ Click Copy Link
                 ├─ navigator.clipboard.writeText()
                 └─ Alert "Link copied!"
```

---

## 🔄 Estado (State Management)

### Estado Global (App.tsx)

```typescript
interface AppState {
  photos: Photo[];           // Array de 5 fotos capturadas
  stripCaption: string;      // Caption generada por AI
  resultsRef: RefObject;     // Para scroll a resultados
}
```

### Estado PhotoBooth

```typescript
interface PhotoBoothState {
  stream: MediaStream | null;      // Stream de cámara activo
  isSessionActive: boolean;        // ¿Captura en progreso?
  photos: Photo[];                 // Fotos en sesión actual
  countdown: number | null;        // Número countdown (3-1)
  photosLeft: number;              // Fotos restantes
  flash: boolean;                  // ¿Mostrar flash?
  error: string;                   // Mensaje de error
}
```

### Estado AIControls

```typescript
interface AIControlsState {
  analyzing: boolean;       // ¿Analizando vibe?
  analysisText: string;     // Resultado de análisis
  captioning: boolean;      // ¿Generando caption?
  generating: boolean;      // ¿Generando imagen?
  generatedImage: string|null;  // Imagen generada
  genPrompt: string;        // Prompt del usuario
  selectedRatio: AspectRatio;   // Ratio seleccionado
}
```

### Estado PhotoStrip

```typescript
interface PhotoStripState {
  activeFilter: FilterType;  // Filtro aplicado
  isGenerating: boolean;     // ¿Generando descarga?
}
```

---

## 🌐 API Contracts

### Gemini Service API

```typescript
// 1. Caption Generation
async generatePhotoStripCaption(numPhotos: number): Promise<string>
// Request: POST /generateContent
// Body: {
//   model: "gemini-2.5-flash",
//   contents: `Generate a short, witty, and fun caption...`
// }
// Response: caption string

// 2. Photo Analysis
async analyzePhotoVibe(photoDataUrl: string): Promise<string>
// Request: POST /generateContent
// Body: {
//   model: "gemini-2.5-pro",
//   contents: {
//     parts: [
//       { inlineData: { mimeType: "image/jpeg", data: base64 } },
//       { text: "Analyze the mood and vibe..." }
//     ]
//   }
// }
// Response: analysis string

// 3. Image Generation
async generateCreativeImage(prompt: string, aspectRatio: AspectRatio): Promise<string|null>
// Request: POST /generateContent
// Body: {
//   model: "gemini-2.5-pro",
//   contents: { parts: [{ text: "Generate an image..." }] }
// }
// Response: base64 PNG or null
```

---

## 📁 Estructura de Carpetas Detallada

```
project-root/
│
├── 📄 App.tsx                         # Componente principal
│   └─ Gestiona estado global y layout
│
├── 📄 index.tsx                       # Punto entrada React
│   └─ ReactDOM.render(App)
│
├── 📄 index.html                      # Template HTML
│   ├─ CDN Tailwind
│   ├─ Custom CSS (flash, perforation)
│   ├─ Importmap (React, Genai)
│   └─ Root div para React
│
├── 📁 components/
│   │
│   ├── 📄 PhotoBooth.tsx
│   │   ├─ useRef: videoRef, canvasRef
│   │   ├─ useState: stream, countdown, photos[]
│   │   ├─ useEffect: startCamera, session loop
│   │   ├─ useCallback: capturePhoto, stopCamera
│   │   ├─ Lógica: getUserMedia, Canvas capture
│   │   └─ UI: video, button, overlays
│   │
│   ├── 📄 PhotoStrip.tsx
│   │   ├─ Props: photos[], caption?
│   │   ├─ State: activeFilter, isGenerating
│   │   ├─ Métodos: generateStripCanvas, download, share
│   │   ├─ FILTERS: 6 definidos
│   │   └─ UI: Grid fotos, botones, botones descarga
│   │
│   └── 📄 AIControls.tsx
│       ├─ Props: photos[], onCaptionGenerated
│       ├─ State: 3 sets (caption, vibe, image gen)
│       ├─ Handlers: 3 async functions
│       ├─ Calls: geminiService.*
│       └─ UI: 3 tarjetas de características
│
├── 📁 services/
│   │
│   └── 📄 geminiService.ts
│       ├─ Initialize: new GoogleGenAI(apiKey)
│       ├─ Exports: 3 async functions
│       ├─ Error handling: fallback messages
│       ├─ Validation: dataUrl parsing
│       └─ Models: gemini-2.5-flash/pro
│
├── 📄 types.ts
│   ├─ interfaces: Photo, AnalysisResult, CaptionResult, ApiError
│   ├─ types: AspectRatio, FilterType
│   └─ No estado, solo tipos
│
├── 📄 vite.config.ts
│   ├─ plugins: @vitejs/plugin-react
│   ├─ server: port 3000, host 0.0.0.0
│   ├─ define: GEMINI_API_KEY
│   └─ resolve: alias @/
│
├── 📄 tsconfig.json
│   ├─ target: ES2022
│   ├─ jsx: react-jsx
│   ├─ types: node
│   └─ paths: @/*
│
├── 📄 package.json
│   ├─ deps: react@19.2, @google/genai@1.30, lucide-react@0.555
│   ├─ devDeps: typescript@5.8, vite@6.2, tailwindcss
│   └─ scripts: dev, build, preview
│
├── 📄 package-lock.json
│   └─ Lockfile exact versions
│
├── 📄 .env.local (NOT in repo)
│   └─ GEMINI_API_KEY=sk-...
│
├── 📄 .gitignore
│   ├─ /node_modules
│   ├─ /dist
│   ├─ .env.local
│   └─ etc
│
├── 📄 README.md
│   └─ Setup instructions
│
├── 📄 REVISION_COMPLETA.md
│   └─ Análisis de errores corregidos
│
└── 📁 dist/ (generated)
    ├─ index.html
    └─ assets/
        ├─ index-XXX.js
        └─ index-XXX.css
```

---

## 🎯 Matriz de Funcionalidades

### Features Matrix

| Característica | Componente | Tecnología | Estado | Prioridad |
|---|---|---|---|---|
| Captura de cámara | PhotoBooth | getUserMedia | ✅ Funcional | P0 |
| Countdown | PhotoBooth | setTimeout | ✅ Funcional | P0 |
| Canvas render | PhotoBooth | Canvas 2D | ✅ Funcional | P0 |
| Flash visual | PhotoBooth | CSS animation | ✅ Funcional | P1 |
| 6 Filtros CSS | PhotoStrip | CSS filter | ✅ Funcional | P1 |
| Descarga individual | PhotoStrip | Blob download | ✅ Funcional | P1 |
| Descarga tira | PhotoStrip | Canvas render | ✅ Funcional | P1 |
| Social share | PhotoStrip | Web Share API | ✅ Funcional | P2 |
| Caption AI | AIControls | Gemini Flash | ✅ Funcional | P1 |
| Vibe analysis | AIControls | Gemini Pro | ✅ Funcional | P2 |
| Image gen | AIControls | Gemini Pro | ✅ Funcional | P2 |
| Error handling | Todos | Try-catch | ✅ Funcional | P0 |
| Responsive UI | App | Tailwind | ✅ Funcional | P0 |
| Loading states | Todos | Spinner | ✅ Funcional | P1 |

---

## 🔍 Testing Recommendations

### Unit Tests

```typescript
// PhotoBooth.tsx
- startCamera() → Valida stream setup
- capturePhoto() → Valida canvas capture
- Session loop → 5 fotos en correcto orden

// PhotoStrip.tsx
- Filtros aplicables → Todas las 6 opciones
- generateStripCanvas() → Salida correcta
- Download trigger → Valida blob creation

// AIControls.tsx
- Caption generation → Mock API response
- Vibe analysis → Base64 parsing
- Image generation → Error handling
```

### Integration Tests

```
- Flujo completo: Captura → Descarga
- Flujo completo: Captura → AI análisis
- Error flow: Camera denied → Error message
- Error flow: API rate limit → Fallback text
```

### E2E Tests

```
- Cypress/Playwright: Full user journey
- Chrome DevTools: Perf testing
- Lighthouse: PWA scoring
```

---

## 🚀 Deployment Checklist

- [ ] API Key en backend (no en cliente)
- [ ] HTTPS enabled
- [ ] CORS configurado para Gemini
- [ ] Bundle size < 250KB
- [ ] Performance: LCP < 2.5s
- [ ] Lighthouse: 90+ score
- [ ] Mobile testing (iOS/Android)
- [ ] Error tracking (Sentry)
- [ ] Analytics (GA4)
- [ ] Rate limiting backend
- [ ] Database for sessions (opcional)
- [ ] Auth/Login (opcional)

---

*Última actualización: 28 de Noviembre de 2025*
