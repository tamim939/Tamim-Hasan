
export enum AppFeature {
  VIDEO_CLEANER = 'VIDEO_CLEANER',
  IMAGE_4K = 'IMAGE_4K',
  DARK_RESTORE = 'DARK_RESTORE',
  AI_GENERATE = 'AI_GENERATE'
}

export interface GenerationResult {
  imageUrl?: string;
  videoUrl?: string;
  originalUrl?: string;
  originalType?: 'image' | 'video';
  timestamp: number;
}
