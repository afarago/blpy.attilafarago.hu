import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { IPyProjectResult } from 'blocklypy';
import { RootState } from '@/app/store';

interface ConversionState {
    conversionResult?: IPyProjectResult;
}

const initialState: ConversionState = {
    conversionResult: undefined,
};

export interface ConversionStateSetPayload extends IPyProjectResult {}

const conversionSlice = createSlice({
    name: 'conversion',
    initialState,
    reducers: {
        conversionSet: (state, action: PayloadAction<ConversionStateSetPayload>) => {
            state.conversionResult = action.payload;
        },
        conversionReset: (state) => {
            state.conversionResult = undefined;
        },
    },
});

// Export the generated action creators for use in components
export const { conversionSet, conversionReset } = conversionSlice.actions;

// Selectors (for accessing state in components)
export const selectConversion = (state: RootState) => state.conversion;
export const selectRbfDecompileData = (state: RootState) =>
    state.conversion.conversionResult?.extra?.['ev3b.source']?.['main'];
export const selectSvgContentData = (state: RootState) =>
    state.conversion.conversionResult?.extra?.['blockly.svg'];
export const selectWeDo2PreviewData = (state: RootState) =>
    state.conversion.conversionResult?.extra?.['wedo2.preview'];

// Export the slice reducer for use in the store configuration
export default conversionSlice.reducer;

export async function handleFileInputConversion(
    files: File[],
    disabledFiles: string[],
    builtin: boolean | undefined,
    additionalCommentsChecked: boolean,
) {
    if (files.length === 0)
        throw new Error(
            'No files to convert. Possible cause is that either none were selected or none were supported.',
        );
    let retval: IPyProjectResult | undefined = undefined;

    const inputData = {
        files,
        disabledFiles,
        builtin,
        additionalCommentsChecked,
    };

    // /* debug mode, handling conversion in the main thread */
    // const isDevEnvironment = process.env.NODE_ENV === 'development';
    // if (isDevEnvironment) {
    //     retval = await processConversion(inputData);
    //     return retval;
    // }

    /* production mode, handling conversion in a worker */
    const worker = new Worker(
        new URL('../../workers/conversionWorker.ts', import.meta.url),
        { type: 'module' },
    );

    retval = await new Promise<IPyProjectResult>((resolve, reject) => {
        worker.postMessage(inputData);

        worker.onmessage = (event: MessageEvent<number | { error: string }>) => {
            if (
                typeof event.data === 'object' &&
                event.data !== null &&
                'error' in event.data
            ) {
                reject(event.data.error); // Reject with the error message from the worker
            } else {
                resolve(event.data as IPyProjectResult); // Type assertion here
            }
        };

        worker.onerror = (error) => {
            reject(error);
        };
    });
    return retval;
}
