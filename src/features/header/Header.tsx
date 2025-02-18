import { useAppDispatch } from '@/app/hooks';
import { fileContentReset } from '@/features/fileContent/fileContentSlice';
import { useBeforeInstallPrompt } from '@/utils/pwainstall-hook';
import React from 'react';
import { Button } from 'react-bootstrap';
import BrandLogo from './BrandLogo';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const { deferredInstallPrompt, handleInstallClick } = useBeforeInstallPrompt();

    const handleClickOnLogo = (event: React.MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();
        dispatch(fileContentReset());
    };

    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-1">
                <div className="container-lg d-flex justify-content-between align-items-stretch">
                    <div
                        className="navbar-brand brandlogo"
                        onClick={handleClickOnLogo}
                        role="button"
                        aria-hidden="true"
                    >
                        <BrandLogo />
                    </div>
                    {deferredInstallPrompt && (
                        <div className="d-flex flex-row align-items-center">
                            <div className="small px-2 text-end">
                                Access BlocklyPy offline
                                <br />
                                using the web app.
                            </div>
                            <Button onClick={handleInstallClick}>Install App</Button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
