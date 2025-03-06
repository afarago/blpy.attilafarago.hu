import {
    FileContentSetPayload,
    fileContentReset,
    fileContentSet,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import {
    conversionReset,
    conversionSet,
    handleFileInputConversion,
} from '@/features/conversion/conversionSlice';
import { selectTabs, toastContentSet } from '@/features/tabs/tabsSlice';

import ReactGA from 'react-ga4';
import { RootState } from '@/app/store';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { supportsExtension } from '../conversion/blpyutil';

const fileContentListenerMiddleware = createListenerMiddleware();

fileContentListenerMiddleware.startListening({
    actionCreator: fileContentSet,
    effect: async (action, listenerApi) => {
        const files = action.payload.files.sort((a, b) =>
            supportsExtension(a.name) === supportsExtension(b.name)
                ? 0
                : supportsExtension(a.name)
                ? -1
                : 1,
        );

        const { additionalCommentsChecked } = selectTabs(
            listenerApi.getState() as RootState,
        );
        const { builtin, disabledFiles } = selectFileContent(
            listenerApi.getState() as RootState,
        );

        // allow components to cache files, to re-convert them
        notifyComponent(action.payload);

        try {
            const retval = await handleFileInputConversion(
                files,
                disabledFiles,
                builtin,
                additionalCommentsChecked,
            );

            ReactGA.send({
                hitType: 'event',
                eventCategory: 'file_conversion',
                eventAction: 'finished_conversion',
                eventLabel: `file_name: ${[...files]
                    .map((f) => (builtin ? '#sample#' : '' + f.name))
                    .join(', ')}`,
            });

            listenerApi.dispatch(toastContentSet(undefined));
            listenerApi.dispatch(conversionSet(retval));
        } catch (error) {
            ReactGA.send({
                hitType: 'event',
                eventCategory: 'file_conversion',
                eventAction: 'failed_conversion',
                eventLabel: `file_name: ${[...files]
                    .map((f) => (builtin ? '#sample#' : '' + f.name))
                    .join(', ')}`,
                eventValue: error,
            });

            console.error('Error converting project to Python:', error);
            listenerApi.dispatch(
                toastContentSet({
                    header: 'Conversion Error',
                    body: [
                        error instanceof Error
                            ? error.message
                            : 'An unknown error occurred.',
                    ],
                }),
            );
            listenerApi.dispatch(conversionReset());
        }
    },
});

fileContentListenerMiddleware.startListening({
    actionCreator: fileContentReset,
    effect: async (action, listenerApi) => {
        // allow components to cache files, to re-convert them
        notifyComponent(undefined);

        listenerApi.dispatch(conversionReset());
    },
});

const notifyComponent = (content: FileContentSetPayload | undefined) => {
    document.dispatchEvent(new CustomEvent('fileContentsUpdated', { detail: content }));
};

export default fileContentListenerMiddleware;
