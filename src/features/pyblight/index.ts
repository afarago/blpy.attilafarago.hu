import './polyfills/bleWritePolyfill';

import { combineReducers } from '@reduxjs/toolkit';
import { compileAndUploadAndRun } from './sagas/compileAndUploadSaga';
import ble, { bleSlice } from './slices/ble';
import compile, { compileSlice } from './slices/compile';
import hub, { hubSlice } from './slices/hub';

export const pyblActions = {
    ...hubSlice.actions,
    ...bleSlice.actions,
    ...compileSlice.actions,
    compileAndUploadAndRun,
};

export const pyblReducer = combineReducers({
    hub,
    ble,
    compile,
});

export const pyblSlices = {
    ble: bleSlice,
    compile: compileSlice,
    hub: hubSlice,
};
