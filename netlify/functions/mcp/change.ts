// netlify/functions/mcp/change.ts
import { Handler } from '@netlify/functions';
import { ModelChangeRequest, ModelChangeResponse } from './types';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let req: ModelChangeRequest;
  try {
    req = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  // Example logic: Update logic would go here
  const res: ModelChangeResponse = {
    contextId: req.contextId,
    updated: true,
    errors: [],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
