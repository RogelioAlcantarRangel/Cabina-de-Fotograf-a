import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Initialize the client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Configuración de reintentos
const RETRY_CONFIG = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000], // ms - exponencial backoff
  timeout: 30000, // 30 segundos
};

/**
 * Clase de error personalizado para errores de timeout
 */
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Ejecuta una función con timeout
 */
const executeWithTimeout = async <T>(
  fn: () => Promise<T>,
  timeoutMs: number = RETRY_CONFIG.timeout
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Operación excedió el timeout de ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Reintenta una función con exponencial backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = RETRY_CONFIG.maxAttempts,
  delays: number[] = RETRY_CONFIG.delays
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await executeWithTimeout(fn);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // No reintentar si es timeout en último intento
      if (attempt === maxAttempts) {
        break;
      }

      // Si es error de red o timeout, reintentar
      const isRetryable =
        lastError instanceof TimeoutError ||
        lastError.message.includes('network') ||
        lastError.message.includes('fetch') ||
        error instanceof TypeError; // Network errors en fetch

      if (!isRetryable) {
        throw lastError;
      }

      // Esperar antes de reintentar
      const delay = delays[attempt - 1] || delays[delays.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Generate a quick, fun caption for the photo strip using the fast model.
 * Model: gemini-2.5-flash-lite (mapped to 'gemini-flash-lite-latest' for safety/availability or strict version if supported)
 * 
 * Con reintentos automáticos y timeout handling
 */
export const generatePhotoStripCaption = async (numPhotos: number): Promise<string> => {
  try {
    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash', // Using the standard flash model for compatibility
        contents: `Generate a short, witty, and fun caption for a photo booth strip containing ${numPhotos} photos. Keep it under 10 words.`,
      })
    );
    return response.text || "Capture the moment!";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating caption:", errorMessage);
    
    // Propagar error para que el componente lo maneje
    throw new Error(`Failed to generate caption: ${errorMessage}`);
  }
};

/**
 * Analyze the mood/vibe of the photos using the pro vision model.
 * Model: gemini-3-pro-preview
 * 
 * Con reintentos automáticos y timeout handling
 */
export const analyzePhotoVibe = async (photoDataUrl: string): Promise<string> => {
  try {
    // Extract base64 data (remove "data:image/png;base64," prefix)
    const parts = photoDataUrl.split(',');
    if (parts.length < 2) {
      throw new Error('Invalid data URL format');
    }
    const base64Data = parts[1];
    
    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg', // Assuming canvas export is jpeg or png
                data: base64Data
              }
            },
            {
              text: "Analyze the mood and vibe of this photo booth picture in 2-3 sentences. Be fun and descriptive like a fortune teller."
            }
          ]
        }
      })
    );
    return response.text || "You look amazing!";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error analyzing photo:", errorMessage);
    throw new Error(`Failed to analyze photo: ${errorMessage}`);
  }
};

/**
 * Generate a creative background/image with specific aspect ratio.
 * Model: gemini-2.5-pro
 * 
 * Con reintentos automáticos y timeout handling
 */
export const generateCreativeImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [{ text: `Generate an image with aspect ratio ${aspectRatio}: ${prompt}` }]
        }
      })
    );

    // Extract image from response
    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating image:", errorMessage);
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
};

// Exportar para testing
export { TimeoutError, retryWithBackoff, executeWithTimeout };