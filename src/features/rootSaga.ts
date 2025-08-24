import { all, put, takeEvery } from 'redux-saga/effects';
// import { showToast } from "../components/ui/toast-context-helpers";
// import type { ToastInput } from "../components/ui/ToastContext";
import pyblightSaga from './pyblight/sagas';
import { bleSlice, compileSlice, hubSlice } from './pyblight/slices';
import { toastContentSet } from './tabs/tabsSlice';
import fileContentSaga from './fileContent/sagas';

// Map actions to message creators
const toastActionMap = [
    {
        action: bleSlice.actions.didConnectDevice,
        getMessage: (action: ReturnType<typeof bleSlice.actions.didConnectDevice>) =>
            `Connected to (${action.payload.device.name})`,
    },
    {
        action: bleSlice.actions.didReceiveWriteStdout,
        getMessage: (
            action: ReturnType<typeof bleSlice.actions.didReceiveWriteStdout>,
            // ) => ({ body: action.payload.trim(), title: 'Hub Output', duration: 8000 }),
        ) => action.payload.trim(),
    },
    {
        action: compileSlice.actions.didCompiledMpy,
        getMessage: (action: ReturnType<typeof compileSlice.actions.didCompiledMpy>) =>
            `Compiled .mpy (${action.payload.size} bytes)`,
    },
    {
        action: compileSlice.actions.didFailToCompileMpy,
        getMessage: (
            action: ReturnType<typeof compileSlice.actions.didFailToCompileMpy>,
        ) => `Failed to compile ${action.payload}`,
    },
    {
        action: hubSlice.actions.didUploadedMpy,
        getMessage: () => `Uploaded .mpy to the hub`,
    },
    {
        action: hubSlice.actions.didFailUploadMpy,
        getMessage: () => `Failed to upload .mpy to the hub`,
    },
];

// Generic handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function* handleToast(action: any, getMessage: (action: any) => ToastInput) {
//   const toast = getMessage(action);
//   if (toast) {
//     yield put(showToast({ toast }));
//   }
// }

function* handleToast(action: any, getMessage: (action: any) => string) {
    const message: string = getMessage(action);
    if (message) {
        // Convert to object
        // toast = { body: toast, duration: 4000 };
        const toast = { body: [message], title: 'Info' };
        yield put(toastContentSet(toast));
    }
}

export default function* rootSaga() {
    yield all([
        fileContentSaga(),
        pyblightSaga(),
        ...toastActionMap.map(({ action, getMessage }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            takeEvery(action, function* (actionInstance: any) {
                yield* handleToast(actionInstance, getMessage);
            }),
        ),
    ]);
}
