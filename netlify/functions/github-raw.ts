import { Handler } from '@netlify/functions';

import fetch from 'node-fetch';

const GITHUB_API_URL = 'https://raw.githubusercontent.com';

const handler: Handler = async (event, context) => {
    //!! master??
    const { owner, repo, path, branch = 'master' } = event.queryStringParameters || {};

    if (!owner || !repo || !path) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required query parameters: owner, repo, path',
            }),
        };
    }

    const url = `${GITHUB_API_URL}/${owner}/${repo}/${branch}/${path}`;

    try {
        const headers: Record<string, string> = {};
        const commonHeaders = [
            'accept',
            'accept-encoding',
            'content-type',
            'user-agent',
            'authorization',
        ];
        for (const header of commonHeaders) {
            if (event.headers[header]) {
                headers[header] = event.headers[header];
            }
        }

        const response = await fetch(url, {
            headers,
            // agent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL verification
        });
        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `Failed to fetch content from GitHub: ${response.statusText}`,
                }),
            };
        }

        const content = await response.text();
        return {
            statusCode: 200,
            body: content,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
        };
    }
};

export { handler };
