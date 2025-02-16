import React, { useEffect, useState } from 'react';
import {
    authenticateGithub,
    listReposGithub,
    logout,
    selectGithubAuthToken,
    selectGithubIsAuthenticated,
    selectGithubRepositories,
} from './githubSlice';

import AutocompleteDropdown from './AutocompleteDropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useAppDispatch } from '@/app/hooks';
import { useSelector } from 'react-redux';

interface GitHubOpenDialogProps {
    show: boolean;
    initialUrl?: string;
    handleClose: (url?: string) => void;
}

const GitHubOpenDialog: React.FC<GitHubOpenDialogProps> = ({
    show,
    initialUrl,
    handleClose,
}) => {
    // const data: GitHubRepository[] = [
    //     {
    //         full_name: 'facebook/react',
    //         url: 'https://api.github.com/repos/facebook/react',
    //         stargazers_count: 160000,
    //         private: false,
    //         description:
    //             'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    //         owner: {
    //             login: 'facebook',
    //             avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    //         },
    //     },
    //     {
    //         full_name: 'facebook/react-native',
    //         url: 'https://api.github.com/repos/facebook/react-native',
    //         stargazers_count: 100000,
    //         private: false,
    //         description: 'A framework for building native apps with React.',
    //         owner: {
    //             login: 'facebook',
    //             avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    //         },
    //     },
    //     {
    //         full_name: 'afarago/2025educup-masters-attilafarago',
    //         url: 'https://api.github.com/afarago/2025educup-masters-attilafarago',
    //         stargazers_count: 2,
    //         private: false,
    //         description: 'asdfsdfsdf',
    //         owner: {
    //             login: 'afarago',
    //             avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
    //         },
    //     },
    //     {
    //         full_name: 'microsoft/vscode',
    //         url: 'https://api.github.com/repos/microsoft/vscode',
    //         stargazers_count: 120000,
    //         private: false,
    //         description: 'Visual Studio Code',
    //         owner: {
    //             login: 'microsoft',
    //             avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
    //         },
    //     },
    // ];
    const dispatch = useAppDispatch();
    const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined); // State to hold selected item
    const [autoCompleteDroppedDown, setAutoCompleteDroppedDown] = useState(false);

    const isAuthenticated = useSelector(selectGithubIsAuthenticated);
    const githubAuthToken = useSelector(selectGithubAuthToken);
    const repositories = useSelector(selectGithubRepositories);

    const isNetlify = (import.meta as any).env.VITE_NETLIFY?.toString() === 'true';

    const handleItemSelect = (item: string) => {
        setSelectedItem(item);
    };

    const handleCloseClick = () => {
        handleClose(selectedItem);
    };

    const handleGitHubAuthClick = async () => {
        try {
            const resultAction = await dispatch(authenticateGithub());
        } catch (err) {
            console.error('Failed to authenticate:', err);
        }
    };

    const handleDropDownToggle = (value: boolean) => {
        setAutoCompleteDroppedDown(value);
    };

    const handleGitHubLogoutClick = () => {
        dispatch(logout());
    };

    useEffect(() => {
        if (githubAuthToken) {
            dispatch(listReposGithub(githubAuthToken));
        }
    }, [githubAuthToken]);

    // const handleLogin = () => {
    //     const clientId = (import.meta as any).env.GITHUB_CLIENT_ID;
    //     const redirectUri = `${window.location.origin}`;
    //     const scope = 'user,repo';

    //     const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    //     window.location.href = authUrl;
    // };

    //   const handleLogout = () => {
    //       setAccessToken(null);
    //       setUserInfo(null);
    //       localStorage.removeItem('github_access_token');
    //   };

    useEffect(() => {
        // initial dialog show
        if (show) {
            setSelectedItem(initialUrl ?? '');
            setTimeout(() => {
                const inputElement = document.getElementById('autocompleteInput');
                inputElement?.focus();
            }, 0);
        }
    }, [show]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // if (event.key === 'Escape' && show && !autoCompleteDroppedDown) {
            //     handleClose();
            // }
            if (event.key === 'Enter' && show && !autoCompleteDroppedDown) {
                handleClose(selectedItem);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, selectedItem, autoCompleteDroppedDown]);

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Open from GitHub</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="small text-muted">
                    <i>
                        This tool supports opening projects from public and private
                        repositories and gists by full url or the individual file url.
                    </i>
                </div>
                <AutocompleteDropdown
                    data={repositories}
                    initialValue={initialUrl}
                    onSelect={handleItemSelect}
                    onDropdownToggle={handleDropDownToggle}
                    show={show}
                />
                {selectedItem && <div className="small text-muted">{selectedItem}</div>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseClick}>
                    Close
                </Button>
                {!isAuthenticated && isNetlify && (
                    <Button variant="secondary" onClick={handleGitHubAuthClick}>
                        Authorize
                    </Button>
                )}
                {isAuthenticated && isNetlify && (
                    <Button variant="secondary" onClick={handleGitHubLogoutClick}>
                        Logout
                    </Button>
                )}
                <Button
                    variant="primary"
                    onClick={handleCloseClick}
                    disabled={selectedItem?.length === 0}
                >
                    Open from GitHub
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GitHubOpenDialog;
