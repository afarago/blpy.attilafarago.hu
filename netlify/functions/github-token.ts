import { Handler, HandlerEvent } from '@netlify/functions';

import axios from 'axios';

const handler: Handler = async (
    event: HandlerEvent,
    //   context: HandlerContext
) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const params = new URLSearchParams(event.body || ''); // Assuming form-urlencoded body
    const code = params.get('code');

    if (!code) {
        return {
            statusCode: 400,
            body: 'Missing authorization code',
        };
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    // const redirectUri = process.env.GITHUB_REDIRECT_URI; // Should match your OAuth App setting
    const redirectUri = params.get('redirect_uri');
    const scope = params.get('scope');

    if (!clientId || !clientSecret || !redirectUri) {
        console.error(
            'Environment/Query variables missing: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, redirectUri',
        );
        return {
            statusCode: 500,
            body: 'Server configuration error',
        };
    }

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                scope: scope,
                redirect_uri: redirectUri,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            },
        );

        if (tokenResponse.data && tokenResponse.data.access_token) {
            return {
                statusCode: 200,
                body: JSON.stringify({ accessToken: tokenResponse.data.access_token }),
            };
        } else {
            console.error('GitHub token exchange failed:', tokenResponse.data);
            return {
                statusCode: 400,
                body: 'Failed to retrieve access token from GitHub',
            };
        }
    } catch (error: any) {
        console.error(
            'Error during token exchange:',
            error.message,
            error.response?.data,
        );
        return {
            statusCode: 500,
            body: 'Error exchanging authorization code for access token',
        };
    }
};

export { handler };
