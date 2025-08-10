import { conversionService } from './conversion-service';
import { fileService } from './file-service';

const SAMPLE_FILES = [
  "demo_cityshaper_cranemission.lms",
  "demo_cityshaper_cranemission.llsp",
  "demo_cityshaper_cranemission.llsp3",
  "demo_cityshaper_cranemission.lmsp",
  "demo_cityshaper_cranemission.ev3",
  "demo_cityshaper_cranemission.rbf",
  "demo_cityshaper_cranemission_wedo2.proj"
];

export async function convertToPython(args: any) {
  const fileResult = await getFileFromArgs(args);
  const config = {
    ...fileResult,
    additionalCommentsChecked: args.comments ?? true,
  };

  const result = await conversionService.convertToPython(config);
  return {
    content: [
      {
        type: 'text',
        text: `Python code generated from ${fileResult.fileName}:\n\n${result.content}`
      }
    ]
  };
}

export async function convertToPlainText(args: any) {
  const fileResult = await getFileFromArgs(args);
  const config = {
    ...fileResult,
    additionalCommentsChecked: args.comments ?? true,
  };

  const result = await conversionService.convertToPlain(config);
  return {
    content: [
      {
        type: 'text',
        text: `Plain text representation of ${fileResult.fileName}:\n\n${result.content}`
      }
    ]
  };
}

export async function generateDependencyGraph(args: any) {
  const fileResult = await getFileFromArgs(args);
  const config = {
    ...fileResult,
    additionalCommentsChecked: args.comments ?? true,
  };

  const result = await conversionService.generateDependencyGraph(config, args.format || 'svg');
  return {
    content: [
      {
        type: 'text',
        text: `Dependency graph for ${fileResult.fileName} (${args.format || 'svg'} format):\n\n${result.content}`
      }
    ]
  };
}

export async function generatePreview(args: any) {
  const fileResult = await getFileFromArgs(args);
  const config = {
    ...fileResult,
    additionalCommentsChecked: args.comments ?? true,
  };

  const result = await conversionService.generatePreview(config, args.format || 'svg');
  return {
    content: [
      {
        type: 'text',
        text: `Graphical preview of ${fileResult.fileName} (${args.format || 'svg'} format):\n\n${result.content}`
      }
    ]
  };
}

export async function getRawSource(args: any) {
  const fileResult = await getFileFromArgs(args);
  const config = {
    ...fileResult,
    rawlevel: args.level ?? 3,
  };

  const result = await conversionService.getRawSource(config);
  return {
    content: [
      {
        type: 'text',
        text: `Raw source content of ${fileResult.fileName}:\n\n${result.content}`
      }
    ]
  };
}

export async function listSampleFiles() {
  return {
    content: [
      {
        type: 'text',
        text: `Available sample files:\n\n${SAMPLE_FILES.map(file => `• ${file}`).join('\n')}\n\nThese files can be used with the 'file' parameter in conversion tools.`
      }
    ]
  };
}

async function getFileFromArgs(args: any) {
  if (args.file) {
    return await fileService.getFileFromSample(args.file, process.env.URL);
  } else if (args.file_content && args.file_name) {
    return fileService.getFileFromBase64(args.file_name, args.file_content);
  } else {
    throw new Error('Either file (sample) or file_content+file_name must be provided');
  }
}