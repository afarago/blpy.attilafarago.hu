import { createAction } from '@reduxjs/toolkit';
import { put, select, take } from 'redux-saga/effects';
import { race } from 'typed-redux-saga';
import { getHubState } from '../selectors';
import {
    compileSlice,
    didCompiledMpy,
    didFailToCompileMpy,
    type CompileInput,
} from '../slices/compile';
import { didFailUploadMpy, didUploadedMpy, hubSlice, HubStatus } from '../slices/hub';

export function* compileAndUploadAndRunSaga(action: {
    payload: CompileInput;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Generator<unknown, void, any> {
    yield put(compileSlice.actions.compilePyToMpyStart(action.payload));

    // Wait for compile to finish
    const { didCompile } = yield* race({
        didCompile: take(didCompiledMpy),
        didFailToCompile: take(didFailToCompileMpy),
    });
    if (!didCompile) return;

    yield put(hubSlice.actions.startUploadMpy());

    // Wait for upload to finish
    const { didUploaded } = yield* race({
        didUploaded: take(didUploadedMpy),
        didFailUpload: take(didFailUploadMpy),
    });
    if (!didUploaded) return;

    const hubState = yield select(getHubState);
    if (hubState.status === HubStatus.Idle) {
        yield put(hubSlice.actions.startUserProgram(0));
    }
}

// Redux action for triggering a toast (event, not state)
export const compileAndUploadAndRun = createAction<CompileInput>(
    'pyblight/compileAndUploadAndRun',
);
