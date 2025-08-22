import { compile as mpyCrossCompileV6 } from "@pybricks/mpy-cross-v6";
import mpyCross6WasmUrl from "@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm?url";
import { call, put, takeEvery } from "typed-redux-saga";
import { compileSlice } from "../slices/compile";
import { cString, encodeUInt32LE } from "./util/mpy";

// Action to clear the compile state
export function* handleClearCompileState() {
  yield* put(compileSlice.actions.clearCompileState());
}

// Async compilation effect
function* handleCompilePyToMpyStart(
  action: ReturnType<typeof compileSlice.actions.compilePyToMpyStart>
) {
  const pyCode = action.payload;
  try {
    const m_main = "__main__";
    const m_name = "test1.py";
    const result: Awaited<ReturnType<typeof mpyCrossCompileV6>> = yield* call(
      () => mpyCrossCompileV6(m_name, pyCode, undefined, mpyCross6WasmUrl)
    );
    if (!result || !result.mpy) {
      yield* put(
        compileSlice.actions.didFailToCompileMpy(
          "Compilation failed: No mpy data"
        )
      );
      return;
    }
    const blobParts: BlobPart[] = [];
    blobParts.push(encodeUInt32LE(result.mpy.length));
    blobParts.push(new Uint8Array(cString(m_main)));
    blobParts.push(new Uint8Array(result.mpy));
    const blob = new Blob(blobParts);
    yield* put(
      compileSlice.actions.didCompiledMpy({
        mpyBlob: blob,
        size: result.mpy.byteLength,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    yield* put(
      compileSlice.actions.didFailToCompileMpy(
        "Compilation failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      )
    );
  }
}

export function* compileSaga() {
  yield* takeEvery(
    compileSlice.actions.compilePyToMpyStart.type,
    handleCompilePyToMpyStart
  );
}
