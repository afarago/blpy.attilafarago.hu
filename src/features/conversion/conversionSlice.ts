import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';
import {
    convertProjectToPython,
    IPyConverterFile,
    IPyConverterOptions,
    IPyProjectResult,
} from 'blocklypy';

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

    const inputs: IPyConverterFile[] = await Promise.all(
        files.map(async (file) => ({
            name: file.webkitRelativePath || file.name,
            buffer: disabledFiles.includes(file.name)
                ? new ArrayBuffer(0)
                : await file.arrayBuffer(),
            size: file.size,
            date: builtin ? undefined : new Date(file.lastModified),
        })),
    );

    const options: IPyConverterOptions = {
        debug: {
            ...(additionalCommentsChecked
                ? {
                      showExplainingComments: true,
                      showBlockIds: true,
                  }
                : {}),
            ...(disabledFiles ? { skipFiles: disabledFiles } : {}),
        },
        output: {
            'ev3b.source': true,
            'blockly.slot': true,
            'blockly.svg': true,
        },
    } satisfies IPyConverterOptions;
    const retval = await convertProjectToPython(inputs, options);

    delete retval.topblocks;
    delete (retval as unknown as any).topLevelStacks;
    delete (retval as unknown as any).lastModifiedDate;
    return retval;
}
