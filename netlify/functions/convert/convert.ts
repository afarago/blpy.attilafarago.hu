process.env.FONTCONFIG_PATH = `${__dirname}/fonts`;
process.env.FC_LANG = 'en_US.UTF-8';

import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { Handler, HandlerEvent } from '@netlify/functions';
import { processConversion } from '../../../src/workers/util';
import { fetchSampleFileFromUrl, handleFileUpload } from './file-handler';
import { sendAnalyticsEvent } from './google-analytics-helper';
import { convertSvgToPngBase64 } from './image-helper';

const baseUrl = process.env.URL;

export const handler: Handler = async (event: HandlerEvent) => {
    try {
        let { fileName, fileBuffer, builtin } = await getFileFromEvent(event, baseUrl);

        // Prepare the conversion configuration
        const endpoint = event.path.split('/').pop();
        const additionalCommentsChecked =
            event.queryStringParameters?.comments === 'false' ? false : true;
        const ext = fileName.split('.').pop()?.toLowerCase();
        const rawlevel =
            event.queryStringParameters?.level === undefined &&
            endpoint?.startsWith('raw')
                ? 3
                : event.queryStringParameters?.level;

        const config = {
            files: [
                new File([fileBuffer], fileName, { type: 'application/octet-stream' }),
            ],
            disabledFiles: [],
            builtin,
            additionalCommentsChecked,
            rawsource: rawlevel,
        };
        const result0 = await processConversion(config);
        const result = result0.content;

        // Handle the response based on the requested endpoint
        let contents = '';
        let mimeType = 'text/plain';
        let isBase64Encoded = false;
        switch (endpoint) {
            case 'plain':
                contents = result.plaincode;
                mimeType = 'text/plain';
                break;
            case 'python':
                contents = result.pycode;
                mimeType = 'text/x-python';
                break;
            case 'graph':
                // format = svg | png | dot | txt
                {
                    const dependencygraph = result.dependencygraph;
                    if (!dependencygraph) throw new Error('Dependency graph not found');

                    // svg mime type
                    const format = event.queryStringParameters?.format || 'svg';
                    if (format === 'svg' || format === 'png') {
                        const graphviz = await Graphviz.load();
                        const svg = await graphviz.dot(dependencygraph);
                        if (!svg) throw new Error('SVG content not found');

                        const imageResult = await getImageContent(svg, format);
                        contents = imageResult.contents;
                        mimeType = imageResult.mimeType;
                        isBase64Encoded = imageResult.isBase64Encoded;
                    } else if (format === 'dot' || format === 'txt') {
                        contents = dependencygraph;
                        mimeType = 'text/plain';
                    }
                }
                break;
            case 'preview':
                // format = svg | png
                {
                    const format = event.queryStringParameters?.format || 'svg';
                    const svg = result.extra?.['blockly.svg'];
                    if (!svg) throw new Error('SVG content not found');

                    const imageResult = await getImageContent(svg, format);
                    contents = imageResult.contents;
                    mimeType = imageResult.mimeType;
                    isBase64Encoded = imageResult.isBase64Encoded;
                }
                break;
            case 'raw':
            case 'rawsource':
                // raw [ev3b_level]
                contents =
                    result.extra?.['ev3g.source'] ??
                    result.extra?.['ev3b.source']?.['main'] ??
                    result.extra?.['sb3.source']?.['project.json'];
                if (typeof contents === 'string') {
                    mimeType = 'text/plain';
                } else if (typeof contents === 'object') {
                    mimeType = 'application/json';
                    contents = JSON.stringify(contents, null, 0);
                }

                break;
            default:
                throw new Error(`Unsupported endpoint: ${endpoint}`);
        }

        if (!contents) throw new Error('Unsupported format or empty content');

        await sendAnalyticsEvent('convert', endpoint, fileName, 200); // Track successful call
        return {
            statusCode: 200,
            body: contents,
            headers: {
                'Content-Type': mimeType,
            },
            isBase64Encoded,
        };
    } catch (error) {
        console.error('Error processing the request:', error);
        await sendAnalyticsEvent('convert', event.path, undefined, 500); // Track error
        return {
            statusCode: 500,
            body: JSON.stringify({
                error:
                    'Internal Server Error: ' +
                    (error instanceof Error ? error.message : String(error)),
            }),
        };
    }
};

async function getFileFromEvent(event: HandlerEvent, baseUrl: string | undefined) {
    if (event.queryStringParameters?.file) {
        const url2 = baseUrl + '/samples/' + event.queryStringParameters.file;
        const { fileName, fileBuffer } = await fetchSampleFileFromUrl(url2);
        if (!fileName || !fileBuffer) throw new Error('Sample file not found');
        return { fileName, fileBuffer, builtin: true };
    } else if (event.httpMethod === 'POST') {
        const { fileName, fileBuffer } = await handleFileUpload(event);
        if (!fileName || !fileBuffer) throw new Error('Uploaded file not found');
        return { fileName, fileBuffer, builtin: false };
    }
    throw new Error('No file provided');
}

async function getImageContent(svg: string, format: string) {
    if (format === 'png') {
        return {
            contents: await convertSvgToPngBase64(svg),
            mimeType: 'image/png',
            isBase64Encoded: true,
        };
    }
    return {
        contents: svg,
        mimeType: 'image/svg+xml',
        isBase64Encoded: false,
    };
}
