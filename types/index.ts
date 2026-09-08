export type PromptMode =
  | 'quick'
  | 'detailed'
  | 'cinematic'
  | 'photorealistic'
  | 'social_trend'
  | 'commercial'
  | 'creative';

export type OutputStyle =
  | 'Photography'
  | 'Cinematic'
  | 'Editorial'
  | 'Fashion'
  | 'Luxury'
  | 'Street Photography'
  | 'Studio'
  | 'Travel'
  | 'Lifestyle'
  | 'Fantasy'
  | 'Artistic';

export type PromptDetailLevel = 'low' | 'medium' | 'high' | 'maximum';

export type TargetPlatform = 'standard' | 'midjourney' | 'flux_sdxl' | 'dalle3';

export interface AdvancedSettings {
  promptDetail: PromptDetailLevel;
  preserveComposition: number; // 0 - 100
  preserveStyle: number; // 0 - 100
  preservePose: number; // 0 - 100
  preserveEnvironment: number; // 0 - 100
  creativity: number; // 0 - 100
  outputStyle: OutputStyle;
  targetPlatform: TargetPlatform;
  lockFaceAndBody?: boolean; // When true, locks nose, ears, eye shape, and body build 100%
  preserveFacialGeometry?: number; // 0 - 100
}

export interface StructuredAnalysis {
  subject: string;
  pose: string;
  composition: string;
  camera: string;
  lens: string;
  lighting: string;
  environment: string;
  clothing: string;
  colors: string;
  mood: string;
  style: string;
  background: string;
  image_quality: string;
  identity_preservation: string;
  special_details: string;
  facial_features_lock?: string;
}

export interface TrendInsights {
  trendStyle: string;
  visualCharacteristics: string[];
  trendScore: number; // 1 - 100
  explanation?: string;
}

export interface GeneratedPromptResult {
  id: string;
  title: string;
  fullPrompt: string;
  shortPrompt: string;
  detailedPrompt: string;
  midjourneyFormat: string;
  fluxFormat: string;
  dalleFormat: string;
  negativePrompt?: string;
  characterRefCommand?: string;
  faceLockGuaranteed?: boolean;
  structuredAnalysis: StructuredAnalysis;
  trendInsights: TrendInsights;
  mode: PromptMode;
  createdAt: string;
  referenceImage: string; // URL or base64
  referenceDimensions?: {
    width: number;
    height: number;
    fileSizeFormatted?: string;
  };
  userPhoto?: string;
  isFavorited: boolean;
  tags: string[];
  settingsUsed: AdvancedSettings;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'creator';
  creditsRemaining: number;
  creditsTotal: number;
  creditPacks: number;
  authProvider?: 'email' | 'google';
  isEmailVerified?: boolean;
}

export interface CreditTransaction {
  id: string;
  type: 'usage' | 'purchase' | 'subscription_refresh';
  amount: number;
  timestamp: string;
  description: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'create'
  | 'history'
  | 'favorites'
  | 'pricing'
  | 'settings'
  | 'landing';
