import type { RootState } from "./types";

export const getPyblState = (state: RootState) => state.pyblight;
export const getBleState = (state: RootState) => getPyblState(state).ble;
export const getCompileState = (state: RootState) =>
  getPyblState(state).compile;
export const getHubState = (state: RootState) => getPyblState(state).hub;
