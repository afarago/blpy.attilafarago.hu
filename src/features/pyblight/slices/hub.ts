import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum HubStatus {
    Idle = 'idle',
    Starting = 'starting',
    Running = 'running',
    Stopping = 'stopping',
    Uploading = 'uploading',
}

interface HubState {
    status: HubStatus;
}

const initialState: HubState = {
    status: HubStatus.Idle,
};

export const hubSlice = createSlice({
    name: 'hub',
    initialState,
    reducers: {
        startUserProgram: (state, _action: PayloadAction<number>) => {
            state.status = HubStatus.Starting;
        },
        stopUserProgram: (state, _action: PayloadAction<number>) => {
            state.status = HubStatus.Stopping;
        },
        userProgramStartedSuccess: (state) => {
            state.status = HubStatus.Running;
        },
        startUploadMpy: (state) => {
            state.status = HubStatus.Uploading;
        },
        didUploadedMpy: (state) => {
            state.status = HubStatus.Idle;
        },
        didFailUploadMpy: (state, _action: PayloadAction<string>) => {
            state.status = HubStatus.Idle;
        },
        didStartedUserProgram: (state) => {
            state.status = HubStatus.Running;
        },
        didStoppedUserProgram: (state) => {
            state.status = HubStatus.Idle;
        },
    },
});

export default hubSlice.reducer;
export const {
    startUserProgram,
    stopUserProgram,
    startUploadMpy,
    didStartedUserProgram,
    didStoppedUserProgram,
    didUploadedMpy,
    didFailUploadMpy,
} = hubSlice.actions;
