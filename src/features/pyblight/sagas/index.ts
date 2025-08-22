import { all, takeEvery } from "redux-saga/effects";
import { put, select } from "typed-redux-saga";
import { getHubState } from "../selectors";
import { bleSlice, hubSlice } from "../slices";
import { HubStatus } from "../slices/hub";
import { bleSaga } from "./bleSaga";
import { compileSaga, handleClearCompileState } from "./compileSaga";
import { hubSaga } from "./hubSaga";
import { Status, statusToFlag } from "./util/protocol";

export function* handleBleStatusReport(
  action: ReturnType<typeof bleSlice.actions.didReadStatusReport>
) {
  const { flags } = action.payload;
  const hubState = yield* select(getHubState);
  const isRunning = Boolean(flags & statusToFlag(Status.UserProgramRunning));
  if (isRunning && hubState.status !== HubStatus.Running) {
    yield* put(hubSlice.actions.didStartedUserProgram());
  } else if (
    !isRunning &&
    (hubState.status === HubStatus.Running ||
      hubState.status === HubStatus.Stopping)
  ) {
    yield* put(hubSlice.actions.didStoppedUserProgram());
  }
}

export default function* pyblightSaga() {
  yield all([
    bleSaga(),
    compileSaga(),
    hubSaga(),

    takeEvery(hubSlice.actions.didUploadedMpy, handleClearCompileState),
    takeEvery(bleSlice.actions.didReadStatusReport, handleBleStatusReport),
  ]);
}
