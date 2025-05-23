import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';

interface ToastContent {
    header?: string;
    body: string[];
}

interface TabsState {
    fullScreen: boolean;
    copying: boolean;
    toastContent?: ToastContent;
    additionalCommentsChecked: boolean;
}

const initialState: TabsState = {
    fullScreen: false,
    copying: false,
    toastContent: undefined,
    additionalCommentsChecked: false,
};

const tabsSlice = createSlice({
    name: 'tabs',
    initialState,
    reducers: {
        fullScreenSet: (state, action: PayloadAction<boolean>) => {
            state.fullScreen = action.payload;
        },
        fullScreenToggle: (state, action: PayloadAction) => {
            state.fullScreen = !state.fullScreen;
        },
        copyingSet: (state, action: PayloadAction<boolean>) => {
            state.copying = action.payload;
        },
        toastContentSet: (state, action: PayloadAction<ToastContent | undefined>) => {
            state.toastContent = action.payload;
        },
        additionalCommentsCheckedSet: (state, action: PayloadAction<boolean>) => {
            state.additionalCommentsChecked = action.payload;
        },
    },
});

// Export the generated action creators for use in components
export const {
    fullScreenSet,
    fullScreenToggle,
    copyingSet,
    toastContentSet,
    additionalCommentsCheckedSet,
} = tabsSlice.actions;

// Selectors (for accessing state in components)
export const selectTabs = (state: RootState) => state.tabs;

// Export the slice reducer for use in the store configuration
export default tabsSlice.reducer;
