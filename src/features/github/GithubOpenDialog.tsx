import React, { useEffect, useState } from 'react';
import {
    authenticateGithub,
    isGithubProxiedViaNetlify,
    listReposAndGistsGithub,
    logout,
    selectGithubAuthToken,
    selectGithubIsAuthenticated,
    selectGithubRepositories,
    selectGithubUser,
} from './githubSlice';

import { useAppDispatch } from '@/app/hooks';
import { RootState } from '@/app/store';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import AutocompleteDropdown from './AutocompleteDropdown';

interface GithubOpenDialogProps {
    show: boolean;
    initialUrl?: string;
    handleClose: (url?: string) => void;
}

const GithubOpenDialog: React.FC<GithubOpenDialogProps> = ({
    show,
    initialUrl,
    handleClose,
}) => {
    const dispatch = useAppDispatch();
    const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined); // State to hold selected item
    const [autoCompleteDroppedDown, setAutoCompleteDroppedDown] = useState(false);

    const githubIsAuthenticated = useSelector(selectGithubIsAuthenticated);
    const githubAuthToken = useSelector(selectGithubAuthToken);
    const githubRepositories = useSelector(selectGithubRepositories);
    const githubUser = useSelector(selectGithubUser);
    const githubLoading = useSelector((state: RootState) => state.github.loading);

    const handleItemSelect = (item: string) => {
        setSelectedItem(item);
    };

    const handleCloseClick = () => {
        handleClose(selectedItem);
    };

    const handleGithubAuthClick = async () => {
        try {
            await dispatch(authenticateGithub());
        } catch (err) {
            console.error('Failed to authenticate:', err);
        }
    };

    const handleDropDownToggle = (value: boolean) => {
        setAutoCompleteDroppedDown(value);
    };

    const handleGithubLogoutClick = () => {
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
        if (githubAuthToken && show) {
            dispatch(listReposAndGistsGithub(githubAuthToken));
        }
    }, [githubAuthToken, show]);

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
                {/* {githubLoading && <div className="me-auto">Loading Github...</div>} */}
                {!githubIsAuthenticated && isGithubProxiedViaNetlify && (
                    <Button
                        variant="secondary"
                        onClick={handleGithubAuthClick}
                        className="me-auto"
                        disabled={githubLoading}
                    >
                        {!githubLoading ? 'Authorize' : 'In Progress...'}
                    </Button>
                )}
                {githubIsAuthenticated && isGithubProxiedViaNetlify && (
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
                            onClick={handleGithubLogoutClick}
                            className="me-auto"
                            disabled={githubLoading}
                        >
                            {!githubLoading ? (
                                <>Logout {githubUser?.login}</>
                            ) : (
                                'In Progress...'
                            )}
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

export default GithubOpenDialog;
