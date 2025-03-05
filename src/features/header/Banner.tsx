import React from 'react';

export const Banner: React.FC = () => {
    return (
        <div
            className="banner text-white d-flex px-2 justify-content-between align-items-center"
            style={{ backgroundColor: '#444', height: '3.0em' }}
        >
            <a
                href="https://toviscsapat.hu"
                target="_blank"
                rel="noreferrer"
                className="pt-1 position-relative"
            >
                <img
                    src="./public/banner-toviscsapat.png"
                    alt="Toviscsapat"
                    style={{ height: '3.0em', width: 'auto' }}
                />
            </a>
            <h4 className="position-relative p-0 m-0">
                » Hungary Champs to Houston! Support Our Team!
            </h4>
            <div>
                <a
                    className="btn btn-outline-light btn-sm mx-1"
                    href="https://gogetfunding.com/team-tovis-x-goes-to-houston/"
                    target="_blank"
                >
                    Support now!
                </a>
                <a
                    className="btn btn-outline-light btn-sm mx-1"
                    href="https://gogetfunding.com/toviscsapat-reszvetele-a-fll-vilagdonton"
                    target="_blank"
                >
                    Támogasd!
                </a>
            </div>
        </div>
    );
};
