import aiSummaryReducer from '@/features/aiSummary/aiSummarySlice';
import conversionReducer from '@/features/conversion/conversionSlice';
import fileContentReducer from '@/features/fileContent/fileContentSlice';
import githubReducer from '@/features/github/githubSlice';
import { pyblReducer } from '@/features/pyblight';
import rootSaga from '@/features/rootSaga';
import tabsReducer from '@/features/tabs/tabsSlice';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        fileContent: fileContentReducer,
        conversion: conversionReducer,
        tabs: tabsReducer,
        github: githubReducer,
        aiSummary: aiSummaryReducer,
        pyblight: pyblReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'fileContent/fileContentSet',
                    'fileContent/fetchRepoContents/fulfilled',
                    'conversion/conversionSet',
                    'ble/didConnectDevice',
                    'compile/didCompiledMpy',
                    'ble/didReadStatusReport',
                ], //!! later //TODO: recheck
                ignoredPaths: [
                    'fileContent.files',
                    'conversion.payload.content.topLevelStacks',
                    'conversion.payload.content.topblocks',
                    'pyblight.compile.mpyBlob',
                    'pyblight.ble.device',
                    'pyblight.ble.connectedDevice',
                    'pyblight.ble.server',
                    'pyblight.ble.pybricksControlChar',
                ],
            },
        }).prepend(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store
export default store;
