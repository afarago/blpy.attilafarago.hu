import React, { useContext } from 'react';

import BrandLogo from './BrandLogo';
import { fileContentReset } from '@/features/fileContent/fileContentSlice';
import { useAppDispatch } from '@/app/hooks';

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
                    <div className="navbar-brand brandlogo" onClick={handleClickOnLogo}>
                        <BrandLogo />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
