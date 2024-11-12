import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <nav className="navbar navbar-expand-sm border-bottom box-shadow mb-3">
                <div className="container">
                    <span
                        className="navbar-brand"
                        style={{ fontSize: '200%', paddingBottom: '0px' }}
                    >
                        <svg
                            height="1.5em"
                            width="4em"
                            style={{ position: 'relative', top: '-5px' }}
                        >
                            <use
                                href="./static/img/logo_full.svg#icon"
                                xlinkHref="img/logo_full.svg#icon"
                            ></use>
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
