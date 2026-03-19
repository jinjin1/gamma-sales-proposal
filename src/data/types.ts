// Gamma API Types

export interface GammaTheme {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ThemeList {
  themes: GammaTheme[];
}

export type GammaFormat = 'presentation' | 'document' | 'webpage' | 'social';
export type GammaTextMode = 'generate' | 'condense' | 'preserve';
export type GammaTextAmount = 'brief' | 'medium' | 'detailed' | 'extensive';
export type GammaImageSource =
  | 'aiGenerated'
  | 'pictographic'
  | 'pexels'
  | 'giphy'
  | 'webAllImages'
  | 'webFreeToUse'
  | 'webFreeToUseCommercially'
  | 'themeAccent'
  | 'placeholder'
  | 'noImages';
export type GammaExportFormat = 'pdf' | 'pptx' | 'png';
export type GammaCardSplit = 'auto' | 'inputTextBreaks';
export type GammaSharingAccess = 'noAccess' | 'view' | 'comment' | 'edit' | 'fullAccess';

export interface GammaTextOptions {
  amount?: GammaTextAmount;
  tone?: string;
  audience?: string;
  language?: string;
}

export interface GammaImageOptions {
  source?: GammaImageSource;
  model?: string;
  style?: string;
}

export interface GammaHeaderFooterItem {
  type: 'text' | 'image' | 'cardNumber';
  value?: string;
  source?: 'themeLogo' | 'custom';
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideFromFirstCard?: boolean;
  hideFromLastCard?: boolean;
}

export interface GammaCardOptions {
  dimensions?: string; // presentation: 'fluid'|'16x9'|'4x3', document: 'fluid'|'pageless'|'letter'|'a4', social: '1x1'|'4x5'|'9x16'
  headerFooter?: Record<string, GammaHeaderFooterItem>;
}

export interface GammaSharingOptions {
  workspaceAccess?: GammaSharingAccess;
  externalAccess?: Exclude<GammaSharingAccess, 'fullAccess'>;
  emailOptions?: {
    recipients: string[];
    access?: GammaSharingAccess;
  };
}

export interface GenerationInput {
  inputText: string;
  textMode: GammaTextMode;
  format?: GammaFormat;
  numCards?: number;
  cardSplit?: GammaCardSplit;
  themeId?: string;
  folderIds?: string[];
  exportAs?: GammaExportFormat;
  additionalInstructions?: string;
  textOptions?: GammaTextOptions;
  imageOptions?: GammaImageOptions;
  cardOptions?: GammaCardOptions;
  sharingOptions?: GammaSharingOptions;
}

export interface TemplateGenerationInput {
  gammaId: string;
  prompt: string;
  themeId?: string;
  folderIds?: string[];
  exportAs?: GammaExportFormat;
  imageOptions?: GammaImageOptions;
  sharingOptions?: GammaSharingOptions;
}

export interface GenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gammaUrl?: string;
  exportUrl?: string;
  error?: string;
}

export interface ExportOptions {
  format: GammaExportFormat;
  outputDir: string;
  fileName?: string;
}
