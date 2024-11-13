import React from 'react';
import { GITHUB_VERSION } from './github_version';

const Footer: React.FC = () => {
    return (
        <footer className="border-top footer text-muted">
            <div className="mx-5">
                &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a>{' '}
                - <span title={GITHUB_VERSION}>2024</span>
            </div>
        </footer>
    );
};

export default Footer;
