import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { processConversion } from '../../src/workers/util';
import { convertSvgToPngBase64 } from './imageHelper';
import { ensureString } from './utils';

export interface ConversionConfig {
  fileName: string;
  fileBuffer: ArrayBuffer;
  builtin: boolean;
  additionalCommentsChecked?: boolean;
  rawlevel?: number | string;
}

export interface ConversionResult {
  content: string;
  mimeType: string;
  isBase64Encoded: boolean;
}

export class ConversionService {
  async convertToPlain(config: ConversionConfig): Promise<ConversionResult> {
    const conversionConfig = {
      files: [new File([config.fileBuffer], config.fileName, { type: 'application/octet-stream' })],
      disabledFiles: [],
      builtin: config.builtin,
      additionalCommentsChecked: config.additionalCommentsChecked ?? true,
      rawsource: config.rawlevel,
    };

    const result = await processConversion(conversionConfig);
    return {
      content: result.content.plaincode ?? '',
      mimeType: 'text/plain',
      isBase64Encoded: false,
    };
  }

  async convertToPython(config: ConversionConfig): Promise<ConversionResult> {
    const conversionConfig = {
      files: [new File([config.fileBuffer], config.fileName, { type: 'application/octet-stream' })],
      disabledFiles: [],
      builtin: config.builtin,
      additionalCommentsChecked: config.additionalCommentsChecked ?? true,
      rawsource: config.rawlevel,
    };

    const result = await processConversion(conversionConfig);
    return {
      content: ensureString(result.content.pycode),
      mimeType: 'text/x-python',
      isBase64Encoded: false,
    };
  }

  async generateDependencyGraph(config: ConversionConfig, format: string = 'svg'): Promise<ConversionResult> {
    const conversionConfig = {
      files: [new File([config.fileBuffer], config.fileName, { type: 'application/octet-stream' })],
      disabledFiles: [],
      builtin: config.builtin,
      additionalCommentsChecked: config.additionalCommentsChecked ?? true,
      rawsource: config.rawlevel,
    };

    const result = await processConversion(conversionConfig);
    const dependencygraph = result.content.dependencygraph;
    
    if (!dependencygraph) {
      throw new Error('Dependency graph not found');
    }

    if (format === 'svg' || format === 'png') {
      const graphviz = await Graphviz.load();
      const svg = await graphviz.dot(dependencygraph);
      if (!svg) throw new Error('SVG content not found');

      return await this.getImageContent(svg, format);
    } else if (format === 'dot' || format === 'txt') {
      return {
        content: dependencygraph,
        mimeType: 'text/plain',
        isBase64Encoded: false,
      };
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  async generatePreview(config: ConversionConfig, format: string = 'svg'): Promise<ConversionResult> {
    const conversionConfig = {
      files: [new File([config.fileBuffer], config.fileName, { type: 'application/octet-stream' })],
      disabledFiles: [],
      builtin: config.builtin,
      additionalCommentsChecked: config.additionalCommentsChecked ?? true,
      rawsource: config.rawlevel,
    };

    const result = await processConversion(conversionConfig);
    const svg = result.content.extra?.['blockly.svg'];
    
    if (!svg) {
      throw new Error('SVG content not found');
    }

    return await this.getImageContent(svg, format);
  }

  async getRawSource(config: ConversionConfig): Promise<ConversionResult> {
    const conversionConfig = {
      files: [new File([config.fileBuffer], config.fileName, { type: 'application/octet-stream' })],
      disabledFiles: [],
      builtin: config.builtin,
      additionalCommentsChecked: config.additionalCommentsChecked ?? true,
      rawsource: config.rawlevel ?? 3,
    };

    const result = await processConversion(conversionConfig);
    const contents = 
      result.content.extra?.['ev3g.source'] ??
      result.content.extra?.['ev3b.source']?.['main'] ??
      result.content.extra?.['sb3.source']?.['project.json'];

    if (typeof contents === 'string') {
      return {
        content: contents,
        mimeType: 'text/plain',
        isBase64Encoded: false,
      };
    } else if (typeof contents === 'object') {
      return {
        content: JSON.stringify(contents, null, 0),
        mimeType: 'application/json',
        isBase64Encoded: false,
      };
    }

    throw new Error('Raw source not found');
  }

  private async getImageContent(svg: string, format: string): Promise<ConversionResult> {
    if (format === 'png') {
      return {
        content: await convertSvgToPngBase64(svg),
        mimeType: 'image/png',
        isBase64Encoded: true,
      };
    }
    return {
      content: svg,
      mimeType: 'image/svg+xml',
      isBase64Encoded: false,
    };
  }
}

export const conversionService = new ConversionService();