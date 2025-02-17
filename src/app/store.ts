import { configureStore } from '@reduxjs/toolkit';
import conversionReducer from '@/features/conversion/conversionSlice';
import fileContentListenerMiddleware from '@/features/fileContent/fileContentListeners';
import fileContentReducer from '@/features/fileContent/fileContentSlice';
import githubReducer from '@/features/github/githubSlice';
import tabsReducer from '@/features/tabs/tabsSlice';

const store = configureStore({
    reducer: {
        fileContent: fileContentReducer,
        conversion: conversionReducer,
        tabs: tabsReducer,
        github: githubReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'fileContent/fileContentSet',
                    'fileContent/fetchRepoContents/fulfilled',
                    'conversion/conversionSet',
                ], //!! later //TODO: recheck
                ignoredPaths: [
                    'fileContent.files',
                    'conversion.payload.content.topLevelStacks',
                    'conversion.payload.content.topblocks',
                ],
            },
        }).prepend(fileContentListenerMiddleware.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store
export default store;
