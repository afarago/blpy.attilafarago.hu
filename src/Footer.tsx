import { GITHUB_VERSION } from './github_version';
import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-top footer text-muted">
        <div className="mx-5">
            &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a> -{' '}
            <span title={GITHUB_VERSION}>2024</span>
        </div>
    </footer>
);

export default Footer;
