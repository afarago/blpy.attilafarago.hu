import { IConversionInputData, processConversion } from './util';

onmessage = async (event: MessageEvent<IConversionInputData>) => {
    try {
        const retval = await processConversion(event.data);
        postMessage(retval);
    } catch (error: any) {
        postMessage({ error: error.message || 'An unknown error occurred.' });
    }
};
