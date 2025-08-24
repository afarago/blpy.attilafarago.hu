import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/app/store';

interface ToastContent {
    title?: string;
    body: string[];
}

interface TabsState {
    fullScreen: boolean;
    copying: boolean;
    toastContent?: ToastContent;
    additionalCommentsChecked: boolean;
    selectedTab?: string;
    selectedSubTab?: string;
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
        selectedTabSet: (state, action: PayloadAction<string | undefined>) => {
            state.selectedTab = action.payload;
        },
        selectedSubTabSet: (state, action: PayloadAction<string | undefined>) => {
            state.selectedSubTab = action.payload;
        }
    },
});

// Export the generated action creators for use in components
export const {
    fullScreenSet,
    fullScreenToggle,
    copyingSet,
    toastContentSet,
    additionalCommentsCheckedSet,
    selectedTabSet,
    selectedSubTabSet,
} = tabsSlice.actions;

// Selectors (for accessing state in components)
export const selectTabs = (state: RootState) => state.tabs;

// Export the slice reducer for use in the store configuration
export default tabsSlice.reducer;
