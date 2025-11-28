# Backend FlashBooth.AI

Este backend proxy protege la API Key de Gemini y expone endpoints seguros para la aplicación frontend.

## Arquitectura

```
Frontend (React/TypeScript)
        ↓ HTTPS (sin exponer API Key)
    Backend (Express)
        ↓ API Key protegida
    Gemini API (Google Cloud)
```

## Instalación

1. Copia `.env.example` a `.env` y coloca tu API Key de Gemini:
   ```bash
   cp .env.example .env
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor:
   ```bash
   npm start
   ```

El servidor escuchará en `http://localhost:3001` por defecto.

## Endpoints

### POST `/api/ai/caption`
Genera un caption corto y divertido para una tira de fotos.

**Request:**
```json
{
  "numPhotos": 5
}
```

**Response:**
```json
{
  "caption": "Cheesy smiles and good times!"
}
```

**Status Codes:**
- `200`: Éxito
- `400`: Request inválido
- `500`: Error del servidor

## Configuración

### Variables de Entorno (`.env`)

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3001
NODE_ENV=development
```

## Desarrollo

Para desarrollo local con hot reload:

```bash
npm install --save-dev nodemon
npx nodemon index.js
```

## Deployment

Simplemente sube el código a Heroku, Railway, Render, etc. y configura `GEMINI_API_KEY` como variable de entorno.
