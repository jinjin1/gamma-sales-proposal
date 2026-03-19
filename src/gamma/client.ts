import {
  type ThemeList,
  type GenerationInput,
  type TemplateGenerationInput,
  type GenerationResponse,
  type ExportOptions,
} from '../data/types.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = 'https://public-api.gamma.app/v1.0';
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

export class GammaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gamma API key is required');
    }
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gamma API error (${response.status}): ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async getThemes(): Promise<ThemeList> {
    return this.request<ThemeList>('GET', '/themes');
  }

  async generatePresentation(input: GenerationInput): Promise<string> {
    const response = await this.request<GenerationResponse>(
      'POST',
      '/generations',
      input,
    );
    return response.id;
  }

  async generateFromTemplate(
    input: TemplateGenerationInput,
  ): Promise<string> {
    const response = await this.request<GenerationResponse>(
      'POST',
      '/generations/from-template',
      input,
    );
    return response.id;
  }

  async pollGeneration(id: string): Promise<GenerationResponse> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const result = await this.request<GenerationResponse>(
        'GET',
        `/generations/${id}`,
      );

      if (result.status === 'completed' || result.status === 'failed') {
        if (result.status === 'failed') {
          throw new Error(
            `Generation failed: ${result.error ?? 'Unknown error'}`,
          );
        }
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error(
      `Generation timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000} seconds`,
    );
  }

  async exportDocument(
    exportUrl: string,
    options: ExportOptions,
  ): Promise<string> {
    const response = await fetch(exportUrl, {
      headers: { 'X-API-KEY': this.apiKey },
    });

    if (!response.ok) {
      throw new Error(
        `Export failed (${response.status}): ${await response.text()}`,
      );
    }

    const buffer = await response.arrayBuffer();
    await mkdir(options.outputDir, { recursive: true });

    const fileName =
      options.fileName ?? `proposal.${options.format}`;
    const filePath = join(options.outputDir, fileName);

    await writeFile(filePath, Buffer.from(buffer));
    return filePath;
  }
}
