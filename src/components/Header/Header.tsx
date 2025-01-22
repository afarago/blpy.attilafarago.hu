import React, { useContext } from 'react';

import LogoFull from '../../assets/img/logo_full.svg?react';
import { MyContext } from '../../contexts/MyContext';

const Header: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { setSelectedFileContent, setConversionResult } = context;

    const handleClickOnLogo = (event: React.MouseEvent<SVGSVGElement>): void => {
        event.preventDefault();

        setSelectedFileContent(undefined);
        setConversionResult(undefined);
    };

    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-1">
                <div className="container-lg">
                    <div className="navbar-brand">
                        <LogoFull
                            height="1.5em"
                            width="4em"
                            className="brandlogo"
                            onClick={handleClickOnLogo}
                        />
                        &nbsp;
                        <b>BlocklyPy</b>
                        <span className="d-none d-sm-inline">&nbsp;· LegoAppTools</span>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
