import { call, put, select, takeEvery } from 'typed-redux-saga';
import { getBleState, getCompileState } from '../selectors';
import { hubSlice } from '../slices/hub';
import {
    createStartUserProgramCommand,
    createStopUserProgramCommand,
    createWriteUserProgramMetaCommand,
    createWriteUserRamCommand,
} from './util/protocol';

function* handleStartUserProgram(
    action: ReturnType<typeof hubSlice.actions.startUserProgram>,
) {
    const slot = action.payload ?? 0;
    const { pybricksControlChar } = yield* select(getBleState);

    try {
        const startCommand = createStartUserProgramCommand(slot);
        const startCommandBuffer = new Uint8Array(startCommand);
        yield* call(() => pybricksControlChar?.writeValueWithResponse(startCommandBuffer));
    } catch {
        // NOOP
    }
}

function* handleStopUserProgram(
    _action: ReturnType<typeof hubSlice.actions.stopUserProgram>,
) {
    const { pybricksControlChar } = yield* select(getBleState);

    try {
        const stopCommand = createStopUserProgramCommand();
        const stopCommandBuffer = new Uint8Array(stopCommand);
        yield* call(() => pybricksControlChar?.writeValueWithResponse(stopCommandBuffer));
    } catch {
        // NOOP
    }
}

function* handleStartUploadMpy(
    _action: ReturnType<typeof hubSlice.actions.startUploadMpy>,
) {
    const { pybricksControlChar, maxWriteSize } = yield* select(getBleState);
    const { mpyBlob } = yield* select(getCompileState);
    if (!pybricksControlChar || !mpyBlob) {
        yield* put(hubSlice.actions.didFailUploadMpy('No device or mpy data'));
        return;
    }
    try {
        const chunkSize = maxWriteSize - 5;
        // Invalidate any existing user program
        {
            const metaCommand = createWriteUserProgramMetaCommand(0);
            const metaCommandBuffer = new Uint8Array(metaCommand);
            yield* call(() =>
                pybricksControlChar.writeValueWithResponse(metaCommandBuffer),
            );
        }

        // Write mpy blob in chunks
        for (let i = 0; i < mpyBlob.size; i += chunkSize) {
            const data = yield* call(() =>
                mpyBlob.slice(i, i + chunkSize).arrayBuffer(),
            );
            const command = createWriteUserRamCommand(i, data);
            const commandBuffer = new Uint8Array(command);
            yield* call(() =>
                pybricksControlChar.writeValueWithResponse(commandBuffer),
            );
        }

        // Send meta command with blob size
        {
            const metaCommand = createWriteUserProgramMetaCommand(mpyBlob.size);
            const metaCommandBuffer = new Uint8Array(metaCommand);
            yield* call(() =>
                pybricksControlChar.writeValueWithResponse(metaCommandBuffer),
            );
        }

        // Dispatch success action
        yield* put(hubSlice.actions.didUploadedMpy());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        yield* put(
            hubSlice.actions.didFailUploadMpy(
                'Upload failed: ' +
                    (error instanceof Error ? error.message : 'Unknown error'),
            ),
        );
    }
}

export function* hubSaga() {
    yield* takeEvery(hubSlice.actions.startUserProgram.type, handleStartUserProgram);
    yield* takeEvery(hubSlice.actions.stopUserProgram.type, handleStopUserProgram);
    yield* takeEvery(hubSlice.actions.startUploadMpy.type, handleStartUploadMpy);
}
