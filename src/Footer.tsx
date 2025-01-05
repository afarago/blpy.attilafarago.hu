import { GITHUB_VERSION } from './github_version';
import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-top footer text-muted">
        <div className="mx-md-5 text-center text-md-end">
            &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a> -{' '}
            <span title={GITHUB_VERSION}>2025</span>
        </div>
    </footer>
);

export default Footer;
