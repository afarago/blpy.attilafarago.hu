import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-3">
                <div className="container">
                    <span className="navbar-brand">
                        <svg height="1.5em" width="4em" className="brandlogo">
                            <use href="./static/img/logo_full.svg#icon" />
                        </svg>
                        &nbsp;
                        <b>BlocklyPy</b> · LegoAppTools
                    </span>
                </div>
            </nav>
        </header>
    );
};

export default Header;
