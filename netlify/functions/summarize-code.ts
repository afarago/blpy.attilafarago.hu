import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

// https://console.groq.com/docs/rate-limits

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
});

const SYSTEM_PROMPT = `You are an assistant to summarize pseudocode of a robot. 
    Summarize the functionality in human readable and easy-to-understand way.
    Summarize the functionality in one extended sentences in first line, then detail it out with a few (5-20) bullet points one per line.
    Bullet list items should be a simple line without any symbols at the beginning.
    Instead of Flipper or EV3, use the term "robot" in the summary.`;

const handler: Handler = async (event) => {
    try {
        const data = event.body as string;

        if (!openai) {
            return {
                statusCode: 500,
                body: 'OpenAI client is not configured.',
            };
        }

        if (!data) {
            return {
                statusCode: 400,
                body: 'No pseudocode provided in request body',
            };
        }

        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: data },
            ],
        });

        // console.log('Response from OpenAI:', JSON.stringify(response, null, 2   ));
        // const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
        // if (!toolCall || toolCall.type !== 'function') {
        //     return {
        //         statusCode: 500,
        //         body: JSON.stringify({
        //             error: 'No valid function call found in response',
        //         }),
        //     };
        // }
        // const functionArgs = (toolCall.function.arguments);
        // const summary = JSON.parse(functionArgs).short_summary;
        const summary = response.choices?.[0]?.message?.content || '';

        return {
            statusCode: 200,
            body: summary,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        };
    } catch (error: any) {
        //console.error('Error summarizing pseudocode:', error);
        return {
            statusCode: 500,
            body: error.message || 'Internal Server Error',
        };
    }
};

export { handler };
