import React, { useEffect, useState } from 'react';

import LogoFull from './img/logo_full.svg?react';

const Header: React.FC = () => {
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

    return (
        <header className={'fixed-top ' + (isScrolled ? 'collapsed' : '')}>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-3">
                <div className="container-md">
                    <div className="navbar-brand w-100">
                        <LogoFull height="1.5em" width="4em" className="brandlogo" />
                        &nbsp;
                        <b>BlocklyPy</b>&nbsp;· LegoAppTools
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
