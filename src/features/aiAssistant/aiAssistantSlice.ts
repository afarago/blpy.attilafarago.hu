import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface AiAssistantState {
    language: 'en-US' | 'hu-HU';
    inputMode: 'voice' | 'text';
    commandInput: string;
    pythonCode: string;
    editInstruction: string;
    isListening: boolean;
    isGenerating: boolean;
    isEditing: boolean;
    error: string | null;
}

const initialState: AiAssistantState = {
    language: 'en-US',
    inputMode: 'text',
    commandInput: '',
    pythonCode: '',
    editInstruction: '',
    isListening: false,
    isGenerating: false,
    isEditing: false,
    error: null,
};

// Mock async thunks
export const generatePythonCode = createAsyncThunk(
    'aiAssistant/generatePythonCode',
    async (text: string) => {
        return new Promise<string>((resolve) =>
            setTimeout(() => resolve(`# Python code for:\n# "${text}"\nprint("Hello, world!")`), 1200)
        );
    }
);

export const applyEditToCode = createAsyncThunk(
    'aiAssistant/applyEditToCode',
    async ({ code, editInstruction }: { code: string; editInstruction: string }) => {
        return new Promise<string>((resolve) =>
            setTimeout(() => resolve(`${code}\n# Edit applied: ${editInstruction}`), 1000)
        );
    }
);

const aiAssistantSlice = createSlice({
    name: 'aiAssistant',
    initialState,
    reducers: {
        setLanguage(state, action: PayloadAction<'en-US' | 'hu-HU'>) {
            state.language = action.payload;
        },
        setInputMode(state, action: PayloadAction<'voice' | 'text'>) {
            state.inputMode = action.payload;
        },
        setCommandInput(state, action: PayloadAction<string>) {
            state.commandInput = action.payload;
        },
        setPythonCode(state, action: PayloadAction<string>) {
            state.pythonCode = action.payload;
        },
        setEditInstruction(state, action: PayloadAction<string>) {
            state.editInstruction = action.payload;
        },
        setIsListening(state, action: PayloadAction<boolean>) {
            state.isListening = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generatePythonCode.pending, (state) => {
                state.isGenerating = true;
                state.error = null;
            })
            .addCase(generatePythonCode.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.pythonCode = action.payload;
            })
            .addCase(generatePythonCode.rejected, (state, action) => {
                state.isGenerating = false;
                state.error = action.error.message || 'Failed to generate code.';
            })
            .addCase(applyEditToCode.pending, (state) => {
                state.isEditing = true;
                state.error = null;
            })
            .addCase(applyEditToCode.fulfilled, (state, action) => {
                state.isEditing = false;
                state.pythonCode = action.payload;
                state.editInstruction = '';
            })
            .addCase(applyEditToCode.rejected, (state, action) => {
                state.isEditing = false;
                state.error = action.error.message || 'Failed to apply edit.';
            });
    },
});

export const {
    setLanguage,
    setInputMode,
    setCommandInput,
    setPythonCode,
    setEditInstruction,
    setIsListening,
    setError,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;