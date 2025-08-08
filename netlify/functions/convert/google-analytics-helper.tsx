export async function sendAnalyticsEvent(command: string, endpoint: string, fileName: string | undefined, status: number) {
    const GA_MEASUREMENT_ID = "G-WRDV9368S9"
    const GA_API_SECRET = process.env.GA_API_SECRET

    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
        console.warn('Google Analytics Measurement ID or API Secret is not set.');
        return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;
    const body = {
        client_id: 'server', // Or generate a unique ID per request
        events: [
            {
                name: `api_${command}`,
                params: {
                    endpoint,
                    status,
                    fileName,
                },
            },
        ],
    };
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}