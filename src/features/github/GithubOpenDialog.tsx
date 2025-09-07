import React, { useEffect, useState } from 'react';
import { authenticateGithub, logout, selectGithub } from './githubSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import AutocompleteDropdown from './AutocompleteDropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface GithubOpenDialogProps {
    initialUrl?: string;
    handleClose: (url?: string) => void;
}

const GithubOpenDialog: React.FC<GithubOpenDialogProps> = ({
    initialUrl,
    handleClose,
}) => {
    const dispatch = useAppDispatch();
    const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined); // State to hold selected item
    const [autoCompleteDroppedDown, setAutoCompleteDroppedDown] = useState(false);

    const github = useAppSelector(selectGithub);

    const handleCloseClick = () => {
        handleClose(selectedItem);
    };

    const handleItemSelect = (item: string) => {
        setSelectedItem(item);
    };

    const handleGithubAuthClick = async () => {
        try {
            await dispatch(authenticateGithub());
        } catch (err) {
            console.error('Failed to authenticate:', err);
        }
    };

    const handleGithubLogoutClick = () => {
        dispatch(logout());
    };

    const handleOnShow = () => {
        setSelectedItem(initialUrl ?? '');
        const inputElement = document.getElementById('autocompleteInput');
        inputElement?.focus();
    };

    // const handleEscapeKeyDown = (event: KeyboardEvent) => {
    //     if (autoCompleteDroppedDown) event.preventDefault();
    // };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !autoCompleteDroppedDown) {
                handleClose(selectedItem);
                event.preventDefault();
            }
            if (event.key === 'Escape') {
                if (autoCompleteDroppedDown) {
                    setAutoCompleteDroppedDown(false);
                } else {
                    handleClose();
                }
                event.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedItem, autoCompleteDroppedDown]);

    return (
        <Modal
            show={true}
            onHide={handleClose}
            size="lg"
            onShow={handleOnShow}
            // onEscapeKeyDown={handleEscapeKeyDown}
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
                    initialValue={initialUrl}
                    handleItemSelect={handleItemSelect}
                    setAutoCompleteDroppedDown={setAutoCompleteDroppedDown}
                />
                {selectedItem && <div className="small text-muted">{selectedItem}</div>}
            </Modal.Body>
            <Modal.Footer>
                {/* {githubLoading && <div className="me-auto">Loading Github...</div>} */}
                {!github.token && github.hasAuthProxy && (
                    <Button
                        variant="secondary"
                        onClick={handleGithubAuthClick}
                        className="me-auto"
                        disabled={github.loading}
                    >
                        {!github.loading ? 'Authorize' : 'In Progress...'}
                    </Button>
                )}
                {github.token && github.hasAuthProxy && (
                    <>
                        <img
                            src={github.user?.avatar_url}
                            width="30"
                            height="30"
                            className="profile-avatar rounded-circle  ms-2"
                            alt="avatar"
                        />
                        <Button
                            variant="secondary"
                            onClick={handleGithubLogoutClick}
                            className="me-auto"
                            disabled={github.loading}
                        >
                            {!github.loading ? (
                                <>Logout {github.user?.login}</>
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
