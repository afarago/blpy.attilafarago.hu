import { useAppDispatch } from '@/app/hooks';
import { fileContentReset } from '@/features/fileContent/fileContentSlice';
import React from 'react';
import BrandLogo from './BrandLogo';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();

    const handleClickOnLogo = (event: React.MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();

        dispatch(fileContentReset());
    };

    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-1">
                <div className="container-lg">
                    <div
                        className="navbar-brand brandlogo"
                        onClick={handleClickOnLogo}
                        role="button"
                        aria-hidden="true"
                    >
                        <BrandLogo />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
