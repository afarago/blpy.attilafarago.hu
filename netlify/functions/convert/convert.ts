import { Handler, HandlerEvent } from '@netlify/functions';
import { conversionService } from '../../shared/conversion-service';
import { fileService } from '../../shared/file-service';
import { handleFileUpload } from './fileHandler';
import { sendAnalyticsEvent } from './googleAnalyticsHelper';

const baseUrl = process.env.URL;

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    // Get file data using shared service
    let fileResult;
    if (event.queryStringParameters?.file) {
      fileResult = await fileService.getFileFromSample(
        event.queryStringParameters.file,
        baseUrl
      );
    } else if (event.httpMethod === 'POST') {
      const { fileName, fileBuffer } = await handleFileUpload(event);
      if (!fileName || !fileBuffer) throw new Error('Uploaded file not found');
      fileResult = fileService.getFileFromBuffer(fileName, fileBuffer);
    } else {
      throw new Error('No file provided');
    }

    // Prepare conversion config
    const endpoint = event.path.split('/').pop();
    const additionalCommentsChecked = event.queryStringParameters?.comments !== 'false';
    const rawlevel = event.queryStringParameters?.level || (endpoint?.startsWith('raw') ? 3 : undefined);
    const format = event.queryStringParameters?.format;

    const config = {
      ...fileResult,
      additionalCommentsChecked,
      rawlevel,
    };

    // Execute conversion using shared service
    let result;
    switch (endpoint) {
      case 'plain':
        result = await conversionService.convertToPlain(config);
        break;
      case 'python':
        result = await conversionService.convertToPython(config);
        break;
      case 'graph':
        result = await conversionService.generateDependencyGraph(config, format || 'svg');
        break;
      case 'preview':
        result = await conversionService.generatePreview(config, format || 'svg');
        break;
      case 'raw':
      case 'rawsource':
        result = await conversionService.getRawSource(config);
        break;
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }

    await sendAnalyticsEvent('convert', endpoint!, fileResult.fileName, 200);
    return {
      statusCode: 200,
      body: result.content,
      headers: {
        'Content-Type': result.mimeType,
      },
      isBase64Encoded: result.isBase64Encoded,
    };

  } catch (error) {
    console.error('Error processing the request:', error);
    await sendAnalyticsEvent('convert', event.path, undefined, 500);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)),
      }),
    };
  }
};