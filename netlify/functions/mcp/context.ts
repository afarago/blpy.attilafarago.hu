// netlify/functions/mcp/context.ts
import { Handler } from '@netlify/functions';
import { ModelContextRequest, ModelContextResponse } from './types';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let req: ModelContextRequest;
  try {
    req = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  // Example logic: Respond with mock data based on input
  const res: ModelContextResponse = {
    contextId: 'ctx-' + (req.modelId || 'unknown'),
    modelId: req.modelId,
    revisionId: req.revisionId || 'latest',
    parameters: {
      sampleParameter: 'exampleValue',
    },
  };

  return {
    statusCode: 200,
    body: JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
