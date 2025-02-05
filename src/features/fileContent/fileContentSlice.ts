import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';
import { getPublicGithubContents } from './ghutils';
import { supportsExtension } from 'blocklypy';
import { getFileExtension } from '@/utils/utils';

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
}

const initialState: FileContentState = {
    files: [],
    builtin: undefined,
    url: undefined,
    loading: false,
    error: null,
    showSpinner: false,
};

export interface FileContentSetPayload extends Omit<FileContentState, 'files'> {
    files: File[];
    url?: string;
}

const fileContentSlice = createSlice({
    name: 'fileContent',
    initialState,
    reducers: {
        fileContentSet: (state, action: PayloadAction<FileContentSetPayload>) => {
            state.files = action.payload.files
                .filter((file) => supportsExtension(getFileExtension(file.name)))
                .map((file) => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                }));
            state.url = action.payload.url;
            state.builtin = action.payload.builtin;
        },
        fileContentReset: (state) => {
            state.files = [];
            state.builtin = undefined;
            state.url = undefined;
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
export const { fileContentSet, fileContentReset } = fileContentSlice.actions;
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
    } catch (error) {
        throw error;
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

                const response = await fetch(url);
                const blob = await response.blob();
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
        { url, builtin }: { url: string; builtin: boolean },
        { dispatch, rejectWithValue },
    ) => {
        try {
            await handleLoadingWithSpinner(dispatch, async () => {
                let { owner, repo, ref, path } =
                    url.match(/gist\.github\.com\/(?<owner>[^\/]+)\/(?<path>[a-f0-9]+)/)
                        ?.groups || {};

                if (path) {
                    repo = 'gist';
                } else {
                    ({ owner, repo, ref, path } =
                        url.match(
                            /github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)(?:\/(?:tree|blob)\/(?<ref>[^\/]+)\/(?<path>.*))?/,
                        )?.groups || {});
                }

                let data = await getPublicGithubContents(owner, repo, path, ref);
                if (!data) throw new Error('Failed to fetch repository contents');

                const payload2: FileContentSetPayload = {
                    files: data
                        .filter((file) =>
                            supportsExtension(getFileExtension(file.name)),
                        )
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
