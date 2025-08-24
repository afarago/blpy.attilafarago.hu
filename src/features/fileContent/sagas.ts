import {
  conversionReset,
  conversionSet,
  handleFileInputConversion,
} from '@/features/conversion/conversionSlice';
import {
  FileContentSetPayload,
  fileContentReset,
  fileContentSet,
  selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import { selectTabs, toastContentSet } from '@/features/tabs/tabsSlice';
import ReactGA from 'react-ga4';
import { call, put, select, takeLatest } from 'typed-redux-saga';
import { resetAiSummary } from '../aiSummary/aiSummarySlice';
import { supportsExtension } from '../conversion/blpyutil';

function notifyComponent(content: FileContentSetPayload | undefined) {
    document.dispatchEvent(new CustomEvent('fileContentsUpdated', { detail: content }));
}

function* handleFileContentSet(action: ReturnType<typeof fileContentSet>) {
    const files = [...action.payload.files].sort((a, b) =>
        supportsExtension(a.name) === supportsExtension(b.name)
            ? 0
            : supportsExtension(a.name)
            ? -1
            : 1,
    );

    const { additionalCommentsChecked } = yield* select(selectTabs);
    const { builtin, disabledFiles } = yield* select(selectFileContent);

    notifyComponent(action.payload);

    try {
        const retval = yield* call(
            handleFileInputConversion,
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

        const logsUnique = retval.logs?.length
            ? Array.from(new Set(retval.logs))
            : undefined;

        yield* put(
            toastContentSet(
                logsUnique?.length
                    ? {
                          title: 'Conversion Success',
                          body: [
                              'Conversion succeeded, but generated warnings',
                              ...logsUnique.map((line) => '* ' + line),
                          ],
                      }
                    : undefined,
            ),
        );
        yield* put(conversionSet(retval.content));
        yield* put(resetAiSummary());
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
        yield* put(
            toastContentSet({
                title: 'Conversion Error',
                body: [
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred.',
                ],
            }),
        );
        yield* put(conversionReset());
        yield* put(resetAiSummary());
    }
}

function* handleFileContentReset() {
    notifyComponent(undefined);
    yield* put(conversionReset());
    yield* put(resetAiSummary());
}

export default function* fileContentSaga() {
    yield* takeLatest(fileContentSet.type, handleFileContentSet);
    yield* takeLatest(fileContentReset.type, handleFileContentReset);
}
