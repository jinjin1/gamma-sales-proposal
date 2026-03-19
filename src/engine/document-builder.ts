import { GammaClient } from '../gamma/client.js';
import type {
  GenerationResponse,
  GammaFormat,
  GammaTextMode,
  GammaTextOptions,
  GammaImageOptions,
  GammaCardOptions,
  GammaSharingOptions,
  GammaExportFormat,
  GammaCardSplit,
} from '../data/types.js';
import type { ProposalContent } from './proposal-template.js';
import { proposalContentToMarkdown } from './proposal-template.js';

export interface DocumentBuildOptions {
  format?: GammaFormat;
  textMode?: GammaTextMode;
  cardSplit?: GammaCardSplit;
  numCards?: number;
  themeId?: string;
  exportAs?: GammaExportFormat;
  additionalInstructions?: string;
  textOptions?: GammaTextOptions;
  imageOptions?: GammaImageOptions;
  cardOptions?: GammaCardOptions;
  sharingOptions?: GammaSharingOptions;
  outputDir?: string;
}

export interface DocumentBuildResult {
  generationId: string;
  gammaUrl: string;
  exportUrl: string;
  localFilePath: string | null;
}

/**
 * Build a proposal document via Gamma API from proposal content.
 */
export async function buildProposalDocument(
  proposalContent: ProposalContent,
  options?: DocumentBuildOptions,
): Promise<DocumentBuildResult> {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY environment variable is not set');
  }

  const client = new GammaClient(apiKey);
  const outputDir = options?.outputDir ?? 'output';

  const markdown = proposalContentToMarkdown(proposalContent);

  const generationId = await client.generatePresentation({
    inputText: markdown,
    textMode: options?.textMode ?? 'preserve',
    format: options?.format ?? 'presentation',
    numCards: options?.numCards,
    cardSplit: options?.cardSplit,
    themeId: options?.themeId,
    exportAs: options?.exportAs ?? 'pdf',
    additionalInstructions: options?.additionalInstructions,
    textOptions: options?.textOptions,
    imageOptions: options?.imageOptions,
    cardOptions: options?.cardOptions,
    sharingOptions: options?.sharingOptions,
  });

  const result: GenerationResponse = await client.pollGeneration(generationId);

  const gammaUrl = result.gammaUrl ?? '';
  const exportUrl = result.exportUrl ?? '';

  let localFilePath: string | null = null;

  if (exportUrl) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitizedName = proposalContent.customerName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    const exportFormat = options?.exportAs ?? 'pdf';
    const fileName = `${sanitizedName}_${dateStr}_proposal.${exportFormat}`;

    localFilePath = await client.exportDocument(exportUrl, {
      format: exportFormat,
      outputDir,
      fileName,
    });
  }

  return {
    generationId,
    gammaUrl,
    exportUrl,
    localFilePath,
  };
}
