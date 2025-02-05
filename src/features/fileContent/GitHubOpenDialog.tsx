import React, { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

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
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
    };

    const handleCloseClick = () => {
        handleClose(inputValue);
    };

    useEffect(() => {
        if (show) setInputValue(initialUrl ?? '');
    }, [show]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && show) {
                handleClose();
            }
            if (event.key === 'Enter' && show) {
                handleClose(inputValue);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, inputValue]);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Open from GitHub</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <textarea
                    placeholder="Enter a public GitHub Repository or Gist URL"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-100"
                />
                <div className="small text-muted">
                    <i>
                        This tool supports opening projects from public repositories and
                        gists by full url or the individual file url.
                    </i>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseClick}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleCloseClick}>
                    Open from GitHub
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GitHubOpenDialog;
