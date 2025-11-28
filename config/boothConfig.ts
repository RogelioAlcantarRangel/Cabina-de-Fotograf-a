/**
 * Configuration - Parámetros configurables de la cabina de fotos
 * Estos valores pueden ser sobrescritos por variables de entorno
 */

export interface BoothConfig {
  photoCount: number;
  countdownSeconds: number;
  jpegQuality: number;
}

/**
 * Carga la configuración desde variables de entorno o usa los valores por defecto
 */
export const loadConfig = (): BoothConfig => {
  return {
    photoCount: parseInt(import.meta.env.VITE_PHOTO_COUNT || '5', 10),
    countdownSeconds: parseInt(import.meta.env.VITE_COUNTDOWN_SECONDS || '3', 10),
    jpegQuality: parseFloat(import.meta.env.VITE_JPEG_QUALITY || '0.9'),
  };
};

/**
 * Configuración exportada y lista para usar
 */
export const boothConfig = loadConfig();

/**
 * Valores para validación de rango
 */
export const configLimits = {
  photoCount: { min: 1, max: 20 },
  countdownSeconds: { min: 1, max: 10 },
  jpegQuality: { min: 0.5, max: 1.0 },
};

/**
 * Validar que los valores de configuración estén dentro de los límites
 */
export const validateConfig = (config: BoothConfig): boolean => {
  return (
    config.photoCount >= configLimits.photoCount.min &&
    config.photoCount <= configLimits.photoCount.max &&
    config.countdownSeconds >= configLimits.countdownSeconds.min &&
    config.countdownSeconds <= configLimits.countdownSeconds.max &&
    config.jpegQuality >= configLimits.jpegQuality.min &&
    config.jpegQuality <= configLimits.jpegQuality.max
  );
};
