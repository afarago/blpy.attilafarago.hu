import LogoFull from './img/logo_full.svg?react';
import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-3">
                <div className="container">
                    <span className="navbar-brand">
                        <LogoFull height="1.5em" width="4em" className="brandlogo" />
                        &nbsp;
                        <b>BlocklyPy</b>
                        <span className="d-none d-sm-inline"> · LegoAppTools</span>
                    </span>
                </div>
            </nav>
        </header>
    );
};

export default Header;
