import { conversionReset, conversionSet } from '@/features/conversion/conversionSlice';
import {
    FileContentSetPayload,
    fileContentReset,
    fileContentSet,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import { selectTabs, toastContentSet } from '@/features/tabs/tabsSlice';
import {
    IPyConverterFile,
    IPyConverterOptions,
    convertProjectToPython,
    supportsExtension,
} from 'blocklypy';

import { RootState } from '@/app/store';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import ReactGA from 'react-ga4';

const fileContentListenerMiddleware = createListenerMiddleware();

fileContentListenerMiddleware.startListening({
    actionCreator: fileContentSet,
    effect: async (action, listenerApi) => {
        const files = action.payload.files.filter((file) =>
            supportsExtension(file.name),
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
            if (files.length === 0)
                throw new Error(
                    'No files to convert. Possible cause is that either none were selected or none were supported.',
                );

            const inputs: IPyConverterFile[] = await Promise.all(
                files.map(async (file) => ({
                    name: file.webkitRelativePath || file.name,
                    buffer: disabledFiles.includes(file.name)
                        ? new ArrayBuffer(0)
                        : await file.arrayBuffer(),
                    size: file.size,
                    date: builtin ? undefined : new Date(file.lastModified),
                })),
            );

            const options: IPyConverterOptions = {
                debug: {
                    ...(additionalCommentsChecked
                        ? {
                              showExplainingComments: true,
                              showBlockIds: true,
                          }
                        : {}),
                    ...(disabledFiles ? { skipFiles: disabledFiles } : {}),
                },
                output: {
                    'ev3b.source': true,
                    'blockly.slot': true,
                    'blockly.svg': true,
                },
            } satisfies IPyConverterOptions;
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
