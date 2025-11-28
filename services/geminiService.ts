import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Initialize the client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generate a quick, fun caption for the photo strip using the fast model.
 * Model: gemini-2.5-flash-lite (mapped to 'gemini-flash-lite-latest' for safety/availability or strict version if supported)
 */
export const generatePhotoStripCaption = async (numPhotos: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Using the lite model alias as per instructions for "Fast AI responses"
      contents: `Generate a short, witty, and fun caption for a photo booth strip containing ${numPhotos} photos. Keep it under 10 words.`,
    });
    return response.text || "Capture the moment!";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Memories made forever.";
  }
};

/**
 * Analyze the mood/vibe of the photos using the pro vision model.
 * Model: gemini-3-pro-preview
 */
export const analyzePhotoVibe = async (photoDataUrl: string): Promise<string> => {
  try {
    // Extract base64 data (remove "data:image/png;base64," prefix)
    const base64Data = photoDataUrl.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
    });
    return response.text || "You look amazing!";
  } catch (error) {
    console.error("Error analyzing photo:", error);
    return "Could not analyze the vibe right now, but you look great!";
  }
};

/**
 * Generate a creative background/image with specific aspect ratio.
 * Model: gemini-3-pro-image-preview
 */
export const generateCreativeImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K" // Defaulting to 1K
        }
      }
    });

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
    console.error("Error generating image:", error);
    throw error;
  }
};