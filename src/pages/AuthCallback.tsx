import React from 'react';

const AuthCallbackPage: React.FC = () => {
    // error=access_denied&error_description=The+user+has+denied+your+application+access.&error_uri
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorUri = searchParams.get('error_uri');

    if (error) {
        return (
            <div>
                <h1>Github Authentication Error</h1>
                <div>{errorDescription}</div>
                {errorUri && (() => {
                    try {
                        const validatedUrl = new URL(errorUri);
                        return (
                            <div>
                                Read more details on <a href={validatedUrl.toString()}>{error}</a>
                            </div>
                        );
                    } catch {
                        return null; // Omit the link if the URL is invalid
                    }
                })()}
            </div>
        );
    }

    return <div>Github Authentication Success</div>;
};

export default AuthCallbackPage;
