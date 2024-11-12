import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="border-top footer text-muted">
            <div className="mx-5">
                &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a>{' '}
                - <span id="github-sha">2024</span>
            </div>
        </footer>
    );
};

export default Footer;
