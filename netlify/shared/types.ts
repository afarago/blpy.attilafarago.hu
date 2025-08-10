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

export interface FileResult {
  fileName: string;
  fileBuffer: ArrayBuffer;
  builtin: boolean;
}

export interface ProcessConversionConfig {
  files: File[];
  disabledFiles: string[];
  builtin: boolean;
  additionalCommentsChecked: boolean;
  rawsource?: number | string;
}

export interface ProcessConversionResult {
  content: {
    plaincode: string;
    pycode: string;
    dependencygraph?: string;
    extra?: {
      [key: string]: any;
      'blockly.svg'?: string;
      'ev3g.source'?: string;
      'ev3b.source'?: { main: string };
      'sb3.source'?: { 'project.json': any };
    };
  };
}

export const SAMPLE_FILES = [
  "demo_cityshaper_cranemission.lms",
  "demo_cityshaper_cranemission.llsp",
  "demo_cityshaper_cranemission.llsp3", 
  "demo_cityshaper_cranemission.lmsp",
  "demo_cityshaper_cranemission.ev3",
  "demo_cityshaper_cranemission.rbf",
  "demo_cityshaper_cranemission_wedo2.proj"
] as const;

export type SampleFileName = typeof SAMPLE_FILES[number];