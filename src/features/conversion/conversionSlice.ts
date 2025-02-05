import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { IPyProjectResult } from 'blocklypy';
import { RootState } from '@/app/store';
import { useAppSelector } from '@/app/hooks';

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
