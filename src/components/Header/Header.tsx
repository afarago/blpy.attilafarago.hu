import React, { useContext } from 'react';

import BrandLogo from './BrandLogo';
import { MyContext } from '../../contexts/MyContext';

const Header: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { setSelectedFileContent, setConversionResult } = context;

    const handleClickOnLogo = (event: React.MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();

        setSelectedFileContent(undefined);
        setConversionResult(undefined);
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
