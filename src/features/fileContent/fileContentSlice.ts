import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';
import { useAppSelector } from '@/app/hooks';

interface UploadedFileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface FileContentState {
    files: UploadedFileInfo[];
    builtin?: boolean;
}

const initialState: FileContentState = {
    files: [],
    builtin: undefined,
};

export interface FileContentSetPayload {
    files: File[];
    builtin: boolean;
    additionalCommentsChecked: boolean;
}

const fileContentSlice = createSlice({
    name: 'fileContent',
    initialState,
    reducers: {
        fileContentSet: (state, action: PayloadAction<FileContentSetPayload>) => {
            state.files = action.payload.files.map((file) => ({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
            }));
            state.builtin = action.payload.builtin;
        },
        fileContentReset: (state) => {
            state.files = [];
            state.builtin = undefined;
        },
    },
});

// Export the generated action creators for use in components
export const { fileContentSet, fileContentReset } = fileContentSlice.actions;

// Selectors (for accessing state in components)
export const selectFileContent = (state: RootState) => state.fileContent;

// Export the slice reducer for use in the store configuration
export default fileContentSlice.reducer;

// export const setFilesAndConvert = createAsyncThunk(
//     'fileselector/setAndConvert', // Unique name for the thunk
//     async (content: { files: File[]; builtin?: boolean }, { dispatch }) => {
//         dispatch(set(content)); // Dispatch the original 'set' action

//         console.log('Converting files:', content.files);
//         // Perform the conversion
//         try {
//             // ...
//         } catch (error) {
//             // Handle error
//         }
//     },
// );
