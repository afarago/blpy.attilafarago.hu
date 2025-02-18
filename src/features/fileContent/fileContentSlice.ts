import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';
import { isGithubProxiedViaNetlify } from '@/features/github/githubSlice';
import { extractGithubUrlInfo, getGithubContents } from '@/features/github/utils';
import axios from 'axios';
import { supportsExtension } from 'blocklypy';

interface UploadedFileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface FileContentState {
    files: UploadedFileInfo[];
    builtin?: boolean;
    url?: string;
    loading?: boolean;
    error?: string | null;
    showSpinner?: boolean;
    disabledFiles: string[];
}

const initialState: FileContentState = {
    files: [],
    builtin: undefined,
    url: undefined,
    loading: false,
    error: null,
    showSpinner: false,
    disabledFiles: [],
};

export interface FileContentSetPayload {
    files: File[]; // file type as payload will directly uses unserializable File type, but we only cache metadata only
    builtin?: boolean;
    url?: string;
    disabledFiles?: string[];
}

export interface FileContentSetEnabledPayload {
    filename: string;
    enabled?: boolean;
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
            state.url = action.payload.url;
            state.builtin = action.payload.builtin;
            state.disabledFiles = action.payload.disabledFiles ?? [];
        },
        fileContentReset: (state) => {
            state.files = [];
            state.disabledFiles = [];
            state.builtin = undefined;
            state.url = undefined;
        },
        fileSetEnabled: (
            state,
            action: PayloadAction<FileContentSetEnabledPayload>,
        ) => {
            //-- let disable also work even if file does not exist on uploaded files (zip file)
            // if (!state.files.find((file) => file.name === action.payload.filename))
            //     return;

            // params: action.payload.enabled - undefined means toggle file enabled/disabled, true/false means set value
            if (action.payload.enabled === undefined) {
                const index = state.disabledFiles.indexOf(action.payload.filename);
                if (index >= 0) state.disabledFiles.splice(index, 1);
                else state.disabledFiles.push(action.payload.filename);
            } else {
                if (action.payload.enabled) {
                    const index = state.disabledFiles.indexOf(action.payload.filename);
                    if (index >= 0) state.disabledFiles.splice(index, 1);
                } else state.disabledFiles.push(action.payload.filename);
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setShowSpinner: (state, action: PayloadAction<boolean>) => {
            state.showSpinner = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRepoContents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRepoContents.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchRepoContents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch repo content';
            })
            .addCase(fetchFileContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFileContent.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchFileContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch file content';
            });
    },
});

// Export the generated action creators for use in components
export const { fileContentSet, fileContentReset, fileSetEnabled } =
    fileContentSlice.actions;
const { setLoading, setShowSpinner } = fileContentSlice.actions;

// Selectors (for accessing state in components)
export const selectFileContent = (state: RootState) => state.fileContent;

// Export the slice reducer for use in the store configuration
export default fileContentSlice.reducer;

const handleLoadingWithSpinner = async (
    dispatch: any,
    asyncFunction: () => Promise<void>,
) => {
    let timer: NodeJS.Timeout | undefined = undefined;
    try {
        dispatch(setLoading(true));
        timer = setTimeout(() => {
            dispatch(setShowSpinner(true));
        }, 250);

        // await new Promise((resolve) => setTimeout(resolve, 4000));
        await asyncFunction();
    } finally {
        if (timer) clearTimeout(timer);
        dispatch(setLoading(false));
        dispatch(setShowSpinner(false));
    }
};

export const fetchFileContent = createAsyncThunk(
    'fileselector/fetchFileContent',
    async ({ url }: { url: string }, { dispatch, rejectWithValue }) => {
        try {
            await handleLoadingWithSpinner(dispatch, async () => {
                if (!url) throw new Error('No example file URL provided');

                const response = await axios.get(url, { responseType: 'blob' });
                const blob = response.data;
                const fileName = url.split('/').pop() ?? url;
                const files = [new File([blob], fileName)];
                const payload: FileContentSetPayload = {
                    files,
                    builtin: true,
                } satisfies FileContentSetPayload;

                dispatch(fileContentSet(payload));
            });
        } catch (error) {
            return rejectWithValue('Failed to fetch example file');
        }
    },
);

export const fetchRepoContents = createAsyncThunk(
    'fileContent/fetchRepoContents',
    async (
        {
            url,
            builtin,
            token,
        }: { url: string; builtin: boolean; token: string | null },
        { dispatch, rejectWithValue },
    ) => {
        try {
            await handleLoadingWithSpinner(dispatch, async () => {
                const ghinfo = extractGithubUrlInfo(url);
                if (!ghinfo) throw new Error('Invalid GitHub URL');

                const useBackendProxy = isGithubProxiedViaNetlify;
                let data = await getGithubContents(ghinfo, token, useBackendProxy);
                if (!data) throw new Error('Failed to fetch repository contents');

                const payload2: FileContentSetPayload = {
                    files: data
                        .filter((file) => supportsExtension(file.name))
                        .map((item) => new File([item.content], item.name)),
                    url,
                    builtin,
                } satisfies FileContentSetPayload;

                dispatch(fileContentSet(payload2));
            });
        } catch (error) {
            return rejectWithValue('Failed to fetch repository contents');
        }
    },
);
