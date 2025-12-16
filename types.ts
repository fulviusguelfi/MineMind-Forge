
export enum PluginType {
  PAPER = 'Paper/Spigot',
  FABRIC = 'Fabric',
  FORGE = 'Forge',
  NEOFORGE = 'NeoForge',
}

export enum AIBehavior {
  PROTECTOR = 'Protector',
  EXPLORER = 'Explorer',
  BUILDER = 'Builder',
  MINER = 'Miner',
  FARMER = 'Farmer',
  GENERALIST = 'Generalist',
}

export enum Nationality {
  AMERICAN = 'American (English)',
  BRAZILIAN = 'Brazilian (Portuguese)',
  SPANISH = 'Spanish (Español)',
  FRENCH = 'French (Français)',
  JAPANESE = 'Japanese (Nihongo)',
  GERMAN = 'German (Deutsch)',
  RUSSIAN = 'Russian (Русский)',
}

export type AppLanguage = 'en' | 'pt' | string;

export interface BotConfig {
  id: string;
  name: string;
  pluginType: PluginType;
  behavior: AIBehavior;
  nationality: Nationality;
  learningRate: number; // 0 to 1
  aggressiveness: number; // 0 to 1
  canChat: boolean;
  systemInstruction: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface BotCommand {
  command: string;
  description: string;
  usage: string;
  example: string;
}

// --- Auth & Localization Types ---

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string; // SHA-256
  salt: string;
  mfaSecret?: string; // For TOTP
  mfaEnabled: boolean;
  customLanguages: Record<string, any>; // Private user translations
  isAdmin?: boolean; // Flag for Docker-initialized admin
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isMfaPending: boolean;
  tempMfaUser?: UserProfile; // Used during login 2nd step
}

export interface TranslationPack {
  code: string;
  name: string;
  data: Record<string, string>;
}

// Extend Window to accept runtime config injected by Docker
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_KEY: string;
      GOOGLE_CLIENT_ID?: string;
      APPLE_CLIENT_ID?: string;
      ADMIN_PASS?: string;
    };
    __ADMIN_PASS__?: string; // Legacy support, but mapped in Dockerfile now
  }
}