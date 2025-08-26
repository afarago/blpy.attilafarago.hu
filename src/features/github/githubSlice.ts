import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    GITHUB_API_URL,
    type GithubEntry,
    type GithubGist,
    type GithubRepository,
} from './utils';

import { RootState } from '@/app/store';
import {
    isElectronEnvironment,
    isNetlifyEnvironment,
    PROD_URL,
} from '@/utils/api-config';
import axios from 'axios';
import { ElectronAPI } from '@/preload';

interface GithubAuthState {
    token: string | null;
    user: {
        login: string;
        avatar_url: string;
    } | null;
    repositories: GithubEntry[];
    repositoriesSearch: GithubEntry[];
    loading: boolean;
    hasAuthProxy: boolean;
}

const initialState: GithubAuthState = {
    token: null,
    repositories: [],
    repositoriesSearch: [],
    user: null,
    loading: false,
    hasAuthProxy: isNetlifyEnvironment() || isElectronEnvironment(),
};

try {
    const token = localStorage.getItem('github_access_token');
    if (token) initialState.token = token;
    const user = localStorage.getItem('github_user');
    if (user) initialState.user = JSON.parse(user);
} catch (error) {
    console.error('Failed to load GitHub token/user from local storage:', error);
    initialState.token = null;
    initialState.user = null;
}

const githubSlice = createSlice({
    name: 'github',
    initialState,
    reducers: {
        // loginSuccess(state, action: PayloadAction<{ user: string; token: string }>) {
        //     state.isAuthenticated = true;
        //     state.token = action.payload.token;
        // },
        logout(state) {
            state.token = null;
            state.user = null;
            state.repositories = [];
            localStorage.removeItem('github_access_token');
            localStorage.removeItem('github_user');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authenticateGithub.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(authenticateGithub.fulfilled, (state, action) => {
                state.loading = false;
                const { token, user } = action.payload;
                state.token = token;
                state.user = user;
                state.repositories = [];
                localStorage.setItem('github_access_token', token);
                localStorage.setItem('github_user', JSON.stringify(user));
            })
            .addCase(authenticateGithub.rejected, (state) => {
                state.loading = false;
                state.token = null;
                state.user = null;
                state.repositories = [];
                localStorage.removeItem('github_access_token');
                localStorage.removeItem('github_user');
            })
            .addCase(listReposAndGistsGithub.pending, (state) => {
                state.loading = true;
            })
            .addCase(listReposAndGistsGithub.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = action.payload;
            })
            .addCase(listReposAndGistsGithub.rejected, (state) => {
                state.loading = false;
                console.error('Failed to list repositories');
            })
            .addCase(searchPublicReposGithub.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchPublicReposGithub.fulfilled, (state, action) => {
                state.loading = false;
                state.repositoriesSearch = action.payload;
            })
            .addCase(searchPublicReposGithub.rejected, (state) => {
                state.loading = false;
                console.error('Failed to search repositories');
            });
    },
});

export const authenticateGithub = createAsyncThunk(
    'github/authenticateGithub',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // 1. start the login process
            const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID; // vite provides env this on compile time
            if (!clientId) {
                return rejectWithValue('Missing GitHub client ID');
            }

            // 2. open the auth window and wait for the token
            /*
              In Electron, we will use the custom protocol handler and listen for the 'oauth-callback' event
              In browser, we will open a new window and listen for the redirect
              Both will use the same redirect URI, which is registered in the GitHub OAuth app
              For Electron, the redirect URI is the productive server that forwards thourgh the AuthWindow calls blpyapp://auth-callback
              For browser, the redirect URI is: https://<your-domain>/auth-callback
              We will also use a state parameter to prevent CSRF attacks
              The state will be a random string, which we will verify when we receive the callback
              The redirect URI will also include a parameter to indicate if we are in Electron or not
            */
            const baseURL = !isElectronEnvironment()
                ? window.location.origin
                : PROD_URL;
            const redirectUri = `${baseURL}/auth-callback${
                isElectronEnvironment() ? '?electron=true' : ''
            }`;
            const scope = 'user,repo,read:org,gist';
            // const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            // crypto is only available in https secure contexts
            const seed =
                typeof crypto?.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : Math.random().toString(36).substring(2);
            const statePayload = {
                seed,
                scope,
                redirect_uri: redirectUri,
            };
            const state = encodeURIComponent(btoa(JSON.stringify(statePayload)));

            // 3. open the auth window and wait for the token
            const token = await new Promise<string>((resolve, reject) => {
                let unsubscribeElecronCallback: (() => void) | undefined;
                const isElectron = isElectronEnvironment();

                // Always open the window before starting the interval
                const params = new URLSearchParams({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    scope: scope,
                    state: state,
                });
                const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
                const authWindow = window.open(
                    authUrl,
                    '_blank',
                    'width=768,height=768',
                );

                // Always check for window closed
                const checkWindowClosed = setInterval(() => {
                    if (!authWindow) return;

                    if (authWindow.closed) {
                        clearInterval(checkWindowClosed);
                        if (isElectron) unsubscribeElecronCallback?.();
                        reject(new Error('Window closed without authentication'));
                    }
                    // In browser, also check for token in URL
                    if (!isElectron) {
                        try {
                            const params = new URLSearchParams(
                                authWindow.location.search,
                            );
                            const state2 = params.get('state');
                            const token = params.get('access_token');
                            if (token) {
                                clearInterval(checkWindowClosed);
                                if (state !== state2) {
                                    reject(new Error('CSRF validation failed'));
                                } else {
                                    authWindow.close();
                                    resolve(token);
                                }
                            }
                        } catch (error) {
                            // Ignore cross-origin errors until window is closed
                            console.error('Error checking auth window URL:', error);
                        }
                    }
                }, 1000);

                // In Electron, listen for the IPC event
                if (isElectron) {
                    unsubscribeElecronCallback =
                        window.electronAPI.onAuthCodeUrlReceived((url: any) => {
                            const params = new URLSearchParams(new URL(url).search);
                            const token = params.get('token');
                            const state2 = params.get('state');
                            if (token) {
                                if (state !== state2) {
                                    clearInterval(checkWindowClosed);
                                    unsubscribeElecronCallback?.();
                                    reject(new Error('CSRF validation failed'));
                                    return;
                                }
                                clearInterval(checkWindowClosed);
                                unsubscribeElecronCallback?.();
                                authWindow?.close();
                                resolve(token);
                            }
                        });
                }
            });

            // 4. get the user data
            const userResponse = await axios.get(`${GITHUB_API_URL}/user`, {
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

export const listReposAndGistsGithub = createAsyncThunk(
    'github/listReposGithub',
    async (token: string, { rejectWithValue }) => {
        try {
            const result: GithubEntry[] = [];
            // 1. get the user repositories
            {
                const response = await axios.get(`${GITHUB_API_URL}/user/repos`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const repos = response.data as GithubRepository[];
                result.push(...repos);
            }

            // 1b. get the user gists
            {
                const response = await axios.get(`${GITHUB_API_URL}/gists`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const gists = response.data as GithubGist[];
                result.push(...gists);
            }

            // 2. get the user orgs
            const orgsResponse = await axios.get(`${GITHUB_API_URL}/user/orgs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 3. get the org repositories
            {
                const orgReposPromise: GithubRepository[][] = await Promise.all(
                    orgsResponse.data.map(async (org: any) => {
                        const orgReposResponse = await axios.get(org.repos_url, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        return orgReposResponse.data as GithubRepository[];
                    }),
                );
                const orgRepos = orgReposPromise.flat();
                result.push(...orgRepos);
            }

            // NOTE: no org gists are available in github now

            return result;
        } catch (error) {
            return rejectWithValue('Failed to list repositories');
        }
    },
);

export const searchPublicReposGithub = createAsyncThunk(
    'github/searchPublicReposGithub',
    async (query: string, { rejectWithValue }) => {
        try {
            if (query.length === 0) return [];

            const token = localStorage.getItem('github_access_token');
            const response = await axios.get(`${GITHUB_API_URL}/search/repositories`, {
                params: {
                    q: query,
                    per_page: 5,
                    page: 1,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const repos = response.data.items as GithubRepository[];
            return repos;
        } catch (error) {
            return rejectWithValue('Failed to search repositories');
        }
    },
);

export const { logout } = githubSlice.actions;

export default githubSlice.reducer;

// Selectors (for accessing state in components)
export const selectGithub = (state: RootState) => state.github;
export const selectGithubAuthToken = (state: RootState) => state.github.token;
export const selectGithubIsAuthenticated = (state: RootState) =>
    state.github.token !== null;
export const selectGithubRepositories = (state: RootState) => state.github.repositories;
export const selectGithubUser = (state: RootState) => state.github.user;
