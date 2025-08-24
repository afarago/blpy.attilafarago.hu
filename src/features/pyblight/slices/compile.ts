import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum CompileStatus {
    Idle = 'idle',
    Compiling = 'compiling',
    Success = 'success',
    Error = 'error',
}

export interface CompileState {
    status: CompileStatus;
    mpyBlob: Blob | null;
    error: string | null;
    size: number;
}

const initialState: CompileState = {
    status: CompileStatus.Idle,
    mpyBlob: null,
    error: null,
    size: 0,
};

export type CompileFile = { filename: string; code: string };
export type CompileInput = string | CompileFile[];

export const compileSlice = createSlice({
    name: 'compile',
    initialState,
    reducers: {
        compilePyToMpyStart: (state, _action: PayloadAction<CompileInput>) => {
            state.status = CompileStatus.Compiling;
            state.error = null;
            state.mpyBlob = null;
            state.size = 0;
        },
        clearCompileState: (state) => {
            Object.assign(state, initialState);
        },
        didCompiledMpy: (
            state,
            action: PayloadAction<{ mpyBlob: Blob; size: number }>,
        ) => {
            state.status = CompileStatus.Success;
            state.mpyBlob = action.payload.mpyBlob;
            state.size = action.payload.size;
            state.error = null;
        },
        didFailToCompileMpy: (state, action: PayloadAction<string>) => {
            state.status = CompileStatus.Error;
            state.error = action.payload;
            state.mpyBlob = null;
            state.size = 0;
        },
    },
});

export default compileSlice.reducer;
export const {
    compilePyToMpyStart,
    didCompiledMpy,
    didFailToCompileMpy,
    clearCompileState,
} = compileSlice.actions;
