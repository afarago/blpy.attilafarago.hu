import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { GitHubRepository } from './ghutils';
import { RootState } from '@/app/store';
import axios from 'axios';

interface AuthState {
    githubToken: string | null;
    githubRepositories: GitHubRepository[];
}

const initialState: AuthState = {
    githubToken: localStorage.getItem('github_access_token'),
    githubRepositories: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // loginSuccess(state, action: PayloadAction<{ user: string; token: string }>) {
        //     state.isAuthenticated = true;
        //     state.token = action.payload.token;
        // },
        logout(state) {
            state.githubToken = null;
            state.githubRepositories = [];
            localStorage.removeItem('github_access_token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authenticateGithub.fulfilled, (state, action) => {
                state.githubToken = action.payload;
            })
            .addCase(authenticateGithub.rejected, (state) => {
                state.githubToken = null;
                localStorage.removeItem('github_access_token');
            })
            .addCase(listReposGithub.fulfilled, (state, action) => {
                state.githubRepositories = action.payload;
            })
            .addCase(listReposGithub.rejected, (state) => {
                console.error('Failed to list repositories');
            });
    },
});

export const authenticateGithub = createAsyncThunk(
    'auth/authenticateGithub',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // 1. start the login process
            const clientId = (import.meta as any).env.VITE_GITHUB_CLIENT_ID; // vite provides env this on compile time
            if (!clientId) {
                return rejectWithValue('Missing GitHub client ID');
            }

            const redirectUri = `${window.location.origin}/auth-callback`;
            const scope = 'user,repo';
            // const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                scope: scope,
            });
            const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
            const authWindow = window.open(authUrl, '_blank', 'width=500,height=600');

            // 2. open auth window and check for the authorization code
            const code = await new Promise<string>((resolve, reject) => {
                const checkWindowClosed = setInterval(() => {
                    try {
                        const params = new URLSearchParams(authWindow?.location.search);
                        const code = params.get('code');
                        if (code) {
                            clearInterval(checkWindowClosed);
                            authWindow?.close();
                            resolve(code);
                        } else if (authWindow?.closed) {
                            clearInterval(checkWindowClosed);
                            reject(new Error('Window closed without authentication'));
                        }
                    } catch (error) {
                        if (authWindow?.closed) {
                            clearInterval(checkWindowClosed);
                            reject(new Error('Window closed without authentication'));
                        }
                    }
                }, 1000);
            });

            // 3. exchange the authorization code for an access token
            const response = await axios.post(
                '/.netlify/functions/github-token',
                new URLSearchParams({
                    code: code,
                    redirect_uri: redirectUri,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                },
            );

            const token = response.data.accessToken as string;
            // setAccessToken(token);
            localStorage.setItem('github_access_token', token);
            // navigate('/'); // Redirect back to the main page

            return token;
        } catch (error) {
            return rejectWithValue('Failed to authenticate with GitHub');
        }
    },
);

export const listReposGithub = createAsyncThunk(
    'auth/listReposGithub',
    async (token: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('github_access_token');
            if (!token) {
                throw new Error('No GitHub access token found');
            }

            const response = await axios.get('https://api.github.com/user/repos', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // console.log('GitHub repositories:', response.data);
            return response.data as GitHubRepository[];
        } catch (error) {
            return rejectWithValue('Failed to list repositories');
        }
    },
);

export const { logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors (for accessing state in components)
export const selectGithubAuthToken = (state: RootState) => state.auth.githubToken;
export const selectGithubIsAuthenticated = (state: RootState) =>
    state.auth.githubToken !== null;
export const selectGithubRepositories = (state: RootState) =>
    state.auth.githubRepositories;
