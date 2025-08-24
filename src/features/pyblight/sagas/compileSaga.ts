import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import mpyCross6WasmUrl from '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm?url';
import { call, put, takeEvery } from 'typed-redux-saga';
import { compileSlice, type CompileInput } from '../slices/compile';
import { cString, encodeUInt32LE } from './util/mpy';

// Action to clear the compile state
export function* handleClearCompileState() {
    yield* put(compileSlice.actions.clearCompileState());
}

// Async compilation effect
function* handleCompilePyToMpyStart(
    action: ReturnType<typeof compileSlice.actions.compilePyToMpyStart>,
) {
    let input: CompileInput = action.payload;
    try {
        const m_main = '__main__';

        const compiledResults: Array<{
            modulename: string;
            filename: string;
            mpy: Uint8Array<ArrayBuffer>;
            length: number;
        }> = [];

        // Support both single string and multiple files
        if (typeof input === 'string') input = [{ filename: 'main.py', code: input }];

        for (const [idx, elem] of input.entries()) {
            const { filename, code } = elem;
            const modulename = !idx ? m_main : filename.replace(/\.py$/, '');
            const result: Awaited<ReturnType<typeof mpyCrossCompileV6>> = yield* call(
                () => mpyCrossCompileV6(filename, code, undefined, mpyCross6WasmUrl),
            );
            if (!result || !result.mpy) {
                yield* put(
                    compileSlice.actions.didFailToCompileMpy(
                        `Compilation failed for ${filename}: No mpy data`,
                    ),
                );
                return;
            }
            compiledResults.push({
                modulename,
                filename,
                mpy: result.mpy as Uint8Array<ArrayBuffer>,
                length: result.mpy.length,
            });
        }
        const blobParts: BlobPart[] = [];
        for (const res of compiledResults) {
            blobParts.push(encodeUInt32LE(res.length));
            blobParts.push(cString(res.modulename) as Uint8Array<ArrayBuffer>);
            blobParts.push(res.mpy);
        }
        const blob = new Blob(blobParts);
        yield* put(
            compileSlice.actions.didCompiledMpy({
                mpyBlob: blob,
                size: blob.size,
            }),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        yield* put(
            compileSlice.actions.didFailToCompileMpy(
                'Compilation failed: ' +
                    (error instanceof Error ? error.message : 'Unknown error'),
            ),
        );
    }
}

export function* compileSaga() {
    yield* takeEvery(
        compileSlice.actions.compilePyToMpyStart.type,
        handleCompilePyToMpyStart,
    );
}
