import React, { MouseEventHandler, useContext, useEffect, useState } from 'react';

import LogoFull from './img/logo_full.svg?react';
import { MyContext } from './contexts/MyContext';

const Header: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { setSelectedFile, setConversionResult } = context;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function handleClickOnLogo(event: React.MouseEvent<SVGSVGElement>): void {
        event.preventDefault();
        setConversionResult(undefined);
        setSelectedFile(undefined);
    }

    return (
        <header className={'fixed-top ' + (isScrolled ? 'collapsed' : '')}>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-3">
                <div className="container-md">
                    <div className="navbar-brand w-100">
                        <LogoFull
                            height="1.5em"
                            width="4em"
                            className="brandlogo"
                            onClick={handleClickOnLogo}
                        />
                        &nbsp;
                        <b>BlocklyPy</b>
                        <span className="d-none d-sm-inline">&nbsp;· LegoAppTools</span>
                        <div className={'float-end ' + (isScrolled ? '' : 'hidden')}>
                            <small>SPIKE and EV3 to Pybricks Wizard</small>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
