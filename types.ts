export interface Photo {
  id: string;
  dataUrl: string; // Base64 image
  timestamp: number;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export type FilterType = 'normal' | 'bw' | 'sepia' | 'vintage' | 'cat' | 'chad';

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface AnalysisResult {
  text: string;
  loading: boolean;
}

export interface CaptionResult {
  text: string;
  loading: boolean;
}