
export enum AppFeature {
  VIDEO_NOISE_REMOVAL = 'VIDEO_NOISE_REMOVAL',
  IMAGE_ENHANCEMENT = 'IMAGE_ENHANCEMENT',
  DARK_RESTORATION = 'DARK_RESTORATION',
  IMAGE_GENERATION = 'IMAGE_GENERATION'
}

export interface GenerationResult {
  imageUrl?: string;
  videoUrl?: string;
  originalUrl?: string;
  timestamp: number;
  prompt?: string;
}
