import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { GitHubRepository } from './ghutils';
import { RootState } from '@/app/store';
import axios from 'axios';

interface AuthState {
    githubToken: string | null;
    githubUser: {
        login: string;
        avatar_url: string;
    } | null;
    githubRepositories: GitHubRepository[];
}

const initialState: AuthState = {
    githubToken: localStorage.getItem('github_access_token'),
    githubRepositories: [],
    githubUser: null,
};

try {
    const token = localStorage.getItem('github_access_token');
    if (token) initialState.githubToken = token;
    const user = localStorage.getItem('github_user');
    if (user) initialState.githubUser = JSON.parse(user);
} catch (error) {
    console.error('Failed to load GitHub token/user from local storage:', error);
    initialState.githubToken = null;
    initialState.githubUser = null;
}

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
            state.githubUser = null;
            state.githubRepositories = [];
            localStorage.removeItem('github_access_token');
            localStorage.removeItem('github_user');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authenticateGithub.fulfilled, (state, action) => {
                const { token, user } = action.payload;
                state.githubToken = token;
                state.githubUser = user;
                state.githubRepositories = [];
                localStorage.setItem('github_access_token', token);
                localStorage.setItem('github_user', JSON.stringify(user));
            })
            .addCase(authenticateGithub.rejected, (state) => {
                state.githubToken = null;
                state.githubUser = null;
                state.githubRepositories = [];
                localStorage.removeItem('github_access_token');
                localStorage.removeItem('github_user');
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
            const scope = 'user,repo,read:org';
            // const scope = 'read:user,read:org,repo';
            // const scope = 'read:org'; // user and read repo is already included
            // const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            const state = Math.random().toString(36).substring(3);
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                scope: scope,
                state: state,
            });
            const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
            const authWindow = window.open(authUrl, '_blank', 'width=768,height=768');

            // 2. open auth window and check for the authorization code
            const code = await new Promise<string>((resolve, reject) => {
                const checkWindowClosed = setInterval(() => {
                    try {
                        const params = new URLSearchParams(authWindow?.location.search);
                        const code = params.get('code');
                        const state2 = params.get('state');
                        if (code) {
                            if (state !== state2) {
                                reject(new Error('CSRF validation failed'));
                            }
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
                    scope: scope,
                    redirect_uri: redirectUri,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                },
            );

            // 4. save the token
            const token = response.data.accessToken as string;

            // 5. get the user data
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // const user = {
            //     login: userResponse.data.login,
            //     avatar_url: userResponse.data.avatar_url,
            // };
            const user = userResponse.data;

            return { token, user };
        } catch (error) {
            return rejectWithValue('Failed to authenticate with GitHub');
        }
    },
);

export const listReposGithub = createAsyncThunk(
    'auth/listReposGithub',
    async (token: string, { rejectWithValue }) => {
        try {
            // 1. get the user repositories
            const response = await axios.get(`https://api.github.com/user/repos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const personalRepos = response.data as GitHubRepository[];

            // 2. get the user orgs
            const orgsResponse = await axios.get(`https://api.github.com/user/orgs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 3. get the org repositories
            const orgReposPromise: GitHubRepository[][] = await Promise.all(
                orgsResponse.data.map(async (org: any) => {
                    const orgReposResponse = await axios.get(org.repos_url, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    return orgReposResponse.data as GitHubRepository[];
                }),
            );
            const orgRepos = orgReposPromise.flat();

            return [...personalRepos, ...orgRepos];
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
export const selectGithubUser = (state: RootState) => state.auth.githubUser;
