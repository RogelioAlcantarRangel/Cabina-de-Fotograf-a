import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/ai/caption', async (req, res) => {
  const { numPhotos } = req.body;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API Key no configurada' });
  }
  if (!numPhotos || typeof numPhotos !== 'number') {
    return res.status(400).json({ error: 'numPhotos requerido' });
  }
  // Aquí iría la llamada real a Gemini API
  // Ejemplo de respuesta simulada
  res.json({ caption: `Generada para ${numPhotos} fotos` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
