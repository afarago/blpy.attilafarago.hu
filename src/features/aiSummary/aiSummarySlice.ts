import { RootState } from '@/app/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AiSummaryState {
    loading: boolean;
    error: string | null;
    code: string | undefined;
    shortSummary: string | undefined;
}

const initialState: AiSummaryState = {
    loading: false,
    error: null,
    code: undefined,
    shortSummary: undefined,
};

export const fetchAiSummary = createAsyncThunk<
    string,
    { pseudocode: string | undefined; pycode: string | undefined },
    { rejectValue: string }
>('aiSummary/fetchAiSummary', async ({ pseudocode, pycode }, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            '/api/summarize-code',
            // { pseudocode, pycode },
            pseudocode ? { pseudocode } : { pycode },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
        const code = response.data as string;
        return code;
    } catch (err: any) {
        return rejectWithValue('Error fetching AI summary');
    }
});

const aiSummarySlice = createSlice({
    name: 'aiSummary',
    initialState,
    reducers: {
        resetAiSummary: (state) => {
            state.loading = false;
            state.error = null;
            state.code = undefined;
            state.shortSummary = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAiSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchAiSummary.fulfilled,
                (state, action: PayloadAction<string>) => {
                    state.loading = false;

                    const code = action.payload;
                    const short_summary = code.split('\n')?.[0];
                    state.code = code;
                    state.shortSummary = short_summary;
                },
            )
            .addCase(fetchAiSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
                // ensure state.error is a string
                if (typeof state.error !== 'string') {
                    state.error = JSON.stringify(state.error);
                }
                state.code = undefined;
            });
    },
});

// Export the generated action creators for use in components
export const { resetAiSummary } = aiSummarySlice.actions;

// Selectors (for accessing state in components)
export const selectAiSummary = (state: RootState) => state.aiSummary;

// Export the slice reducer for use in the store configuration
export default aiSummarySlice.reducer;
