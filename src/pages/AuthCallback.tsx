import axios from 'axios';
import React, { useEffect, useMemo } from 'react';

const AuthCallbackPage: React.FC = () => {
    // error=access_denied&error_description=The+user+has+denied+your+application+access.&error_uri
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorUri = searchParams.get('error_uri');
    const isElectron = searchParams.has('electron');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const tokenParam = searchParams.get('access_token') || undefined;
    const [token, setToken] = React.useState<string | undefined>(tokenParam);

    const { scope, redirect_uri } = useMemo(() => {
        if (!state) return {};
        try {
            return JSON.parse(atob(decodeURIComponent(state))) as {
                // seed: string;
                scope: string;
                redirect_uri: string;
            };
        } catch {
            return { scope: null, redirect_uri: null };
        }
    }, [state]);

    if (error || !code || !redirect_uri || !scope || !state) {
        return (
            <div>
                <h1>Github Authentication Error</h1>
                <div>{errorDescription}</div>
                {errorUri &&
                    (() => {
                        try {
                            const validatedUrl = new URL(errorUri);
                            return (
                                <div>
                                    Read more details on{' '}
                                    <a href={validatedUrl.toString()}>{error}</a>
                                </div>
                            );
                        } catch {
                            return null; // Omit the link if the URL is invalid
                        }
                    })()}
            </div>
        );
    }

    useEffect(() => {
        const exchangeCodeForToken = async () => {
            if (!error && code && redirect_uri && scope && state) {
                try {
                    const response = await axios.post(
                        '/api/github-token',
                        {
                            code,
                            scope,
                            redirect_uri,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        },
                    );
                    const accessToken = response.data.accessToken as string;
                    if (!accessToken) throw new Error('No access token received');
                    setToken(accessToken);

                    // also update the location history adding the token and state as param
                    const params = new URLSearchParams({
                        code,
                        state,
                        access_token: accessToken,
                    });
                    window.location.href = `${
                        window.location.pathname
                    }?${params.toString()}`;

                    // dispatch(authed({ code, state, scope, redirectUri, token }));
                } catch (err) {
                    // Handle error if needed
                }
            }
        };
        if (!token) exchangeCodeForToken();
    }, [error, code, redirect_uri, scope, state, token]);

    useEffect(() => {
        // If Electron and code is present, redirect to custom protocol
        if (isElectron && code && token) {
            const params = new URLSearchParams({
                code,
                state,
                token,
            });
            window.location.href = `blpyapp://oauth-callback?${params.toString()}`;
            // return <div>Redirecting to the application...</div>;
        }
    }, [isElectron, code, token, state]);

    if (!token) {
        return (
            <div>
                <h1>Github Authentication In Progress</h1>
                <div>Exchanging code for access token</div>
                <div>Please wait...</div>
            </div>
        );
    } else {
        return (
            <div>
                <h1>Github Authentication Success</h1>
                <div>Please return to the application.</div>
            </div>
        );
    }
};

export default AuthCallbackPage;
