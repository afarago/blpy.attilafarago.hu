import {
    FileContentSetPayload,
    fileContentReset,
    fileContentSet,
} from '@/features/fileContent/fileContentSlice';
import {
    IPyConverterFile,
    IPyConverterOptions,
    convertProjectToPython,
} from 'blocklypy';
import { conversionReset, conversionSet } from '@/features/conversion/conversionSlice';

import ReactGA from 'react-ga4';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toastContentSet } from '@/features/tabs/tabsSlice';

const fileContentListenerMiddleware = createListenerMiddleware();

fileContentListenerMiddleware.startListening({
    actionCreator: fileContentSet,
    effect: async (action, listenerApi) => {
        const files = action.payload.files;
        const builtin = action.payload.builtin;
        const additionalCommentsChecked = action.payload.additionalCommentsChecked;

        // allow components to cache files, to re-convert them
        notifyComponent(action.payload);

        try {
            const inputs: IPyConverterFile[] = [];
            for (const file of files) {
                const buffer = await file.arrayBuffer();
                const date = builtin ? undefined : new Date(file.lastModified);
                // directory picker adds webkitRelativePath, better visibility for dependency graph
                const name = (file as any).webkitRelativePath || file.name;

                inputs.push({
                    name,
                    buffer,
                    size: file.size,
                    date,
                });
            }

            const options: IPyConverterOptions = {
                debug: {
                    ...(additionalCommentsChecked
                        ? { showExplainingComments: true, showBlockIds: true }
                        : {}),
                },
                output: {
                    'ev3b.source': true,
                    'blockly.slot': true,
                    'blockly.svg': true,
                },
            };
            const retval = await convertProjectToPython(inputs, options);

            ReactGA.send({
                hitType: 'event',
                eventCategory: 'file_conversion',
                eventAction: 'finished_conversion',
                eventLabel: `file_name: ${[...files]
                    .map((f) => (builtin ? '#sample#' : '' + f.name))
                    .join(', ')}`,
            });

            delete retval.topblocks;
            delete (retval as unknown as any).topLevelStacks;
            delete (retval as unknown as any).lastModifiedDate;

            listenerApi.dispatch(toastContentSet(undefined));
            listenerApi.dispatch(conversionSet({ content: retval }));
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
                toastContentSet(
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred.',
                ),
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
