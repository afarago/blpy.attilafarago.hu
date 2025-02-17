import React, { useEffect, useState } from 'react';
import {
    authenticateGithub,
    listReposGithub,
    logout,
    selectGithubAuthToken,
    selectGithubIsAuthenticated,
    selectGithubRepositories,
    selectGithubUser,
} from './githubSlice';

import AutocompleteDropdown from './AutocompleteDropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
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

    const githubIsAuthenticated = useSelector(selectGithubIsAuthenticated);
    const githubAuthToken = useSelector(selectGithubAuthToken);
    const githubRepositories = useSelector(selectGithubRepositories);
    const githubUser = useSelector(selectGithubUser);

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

    const handleOnShow = () => {
        setSelectedItem(initialUrl ?? '');
        const inputElement = document.getElementById('autocompleteInput');
        inputElement?.focus();
    };

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
        if (autoCompleteDroppedDown) {
            event.preventDefault();
        }
    };

    useEffect(() => {
        if (githubAuthToken) {
            dispatch(listReposGithub(githubAuthToken));
        }
    }, [githubAuthToken]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            onShow={handleOnShow}
            onEscapeKeyDown={handleEscapeKeyDown}
            className="GithubDialog"
        >
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
                    data={githubRepositories}
                    initialValue={initialUrl}
                    onSelect={handleItemSelect}
                    onDropdownToggle={handleDropDownToggle}
                    show={show}
                />
                {selectedItem && <div className="small text-muted">{selectedItem}</div>}
            </Modal.Body>
            <Modal.Footer>
                {!githubIsAuthenticated && isNetlify && (
                    <Button
                        variant="secondary"
                        onClick={handleGitHubAuthClick}
                        className="me-auto"
                    >
                        Authorize
                    </Button>
                )}
                {githubIsAuthenticated && isNetlify && (
                    <>
                        <img
                            src={githubUser?.avatar_url}
                            width="30"
                            height="30"
                            className="profile-avatar rounded-circle  ms-2"
                            alt="avatar"
                        />
                        <Button
                            variant="secondary"
                            onClick={handleGitHubLogoutClick}
                            className="me-auto"
                        >
                            Logout {githubUser?.login}
                        </Button>
                    </>
                )}
                <Button variant="secondary" onClick={handleCloseClick}>
                    Close
                </Button>
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
