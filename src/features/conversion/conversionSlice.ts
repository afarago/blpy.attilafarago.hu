import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { IPyProjectResult } from 'blocklypy';
import { RootState } from '@/app/store';
import { useAppSelector } from '@/app/hooks';

interface ConversionState {
    content?: IPyProjectResult;
}

const initialState: ConversionState = {
    content: undefined,
};

export interface ConversionStateSetPayload {
    content?: IPyProjectResult;
}

const conversionSlice = createSlice({
    name: 'conversion',
    initialState,
    reducers: {
        conversionSet: (state, action: PayloadAction<ConversionStateSetPayload>) => {
            state.content = action.payload.content;
        },
        conversionReset: (state) => {
            state.content = undefined;
        },
    },
});

// Export the generated action creators for use in components
export const { conversionSet, conversionReset } = conversionSlice.actions;

// Selectors (for accessing state in components)
export const selectConversion = (state: RootState) => state.conversion;
export const selectConversionResult = (state: RootState) => state.conversion.content;
export const selectRbfDecompileData = (state: RootState) =>
    state.conversion.content?.extra?.['ev3b.source']?.['main'];
export const selectSvgContentData = (state: RootState) =>
    state.conversion.content?.extra?.['blockly.svg'];

// Export the slice reducer for use in the store configuration
export default conversionSlice.reducer;
