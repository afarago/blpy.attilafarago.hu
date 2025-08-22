import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './types';
import { getCompileState, getHubState } from './selectors';
import { compileSlice, CompileStatus } from './slices/compile';
import { hubSlice, HubStatus } from './slices/hub';

// Generalized waitForState helper
const waitForState = async <T>(
    getStatus: () => T,
    isDone: (status: T) => boolean,
    isSuccess: (status: T) => boolean,
): Promise<boolean> => {
    while (true) {
        const status = getStatus();
        if (isDone(status)) {
            return isSuccess(status);
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
};

// Thunk: compile, upload, and run
export const compileAndUploadAndRun = createAsyncThunk<
    void,
    string,
    { dispatch: AppDispatch; state: RootState }
>('pyblight/compileAndUpload', async (code, { dispatch, getState }) => {
    console.log('Starting compile and upload process...');
    await dispatch(compileSlice.actions.compilePyToMpyStart(code));

    const didCompiledMpy = await waitForState(
        () => getCompileState(getState()).status,
        (status) => status !== CompileStatus.Compiling,
        (status) => status === CompileStatus.Success,
    );
    if (!didCompiledMpy) return;

    await dispatch(hubSlice.actions.startUploadMpy());

    const didUpload = await waitForState(
        () => getHubState(getState()).status,
        (status) => status !== HubStatus.Uploading,
        (status) => status === HubStatus.Idle,
    );
    if (!didUpload) return;

    const hubState = getHubState(getState());
    if (hubState.status === HubStatus.Idle) {
        await dispatch(hubSlice.actions.startUserProgram(0));
    }
});
