/// <reference types="vite/client" />
import { EnvelopeFill, Facebook, Linkedin } from 'react-bootstrap-icons';

import React from 'react';

const Footer: React.FC = () => (
    <footer
        className="border-top footer text-muted py-2"
        aria-hidden="true"
        role="presentation"
    >
        <div className="container text-center d-flex flex-column">
            <div
                className="small text-muted align-self-center hide-on-short"
                style={{ maxWidth: '80em' }}
            >
                No robots were harmed in making this converter and visualizer of LEGO
                SPIKE and EV3 robot files. News and updates are available on the{' '}
                <a
                    href="https://www.facebook.com/ev3treevis"
                    target="_blank"
                    aria-label="Facebook page for EV3TreeVis"
                    tabIndex={-1}
                >
                    facebook page
                </a>
                , open-source on{' '}
                <a
                    href="https://github.com/afarago/blpy.attilafarago.hu"
                    target="_blank"
                    aria-label="GitHub repository for BlocklyPy"
                    tabIndex={-1}
                >
                    GitHub
                </a>{' '}
                and{' '}
                <a
                    href="https://www.npmjs.com/package/blocklypy"
                    target="_blank"
                    aria-label="NPM package for BlocklyPy"
                    tabIndex={-1}
                >
                    npm
                </a>
                , with{' '}
                <a href="/api" target="_blank" rel="external" tabIndex={-1}>
                    API
                </a>
                . You might freely use, share any generated artifacts, visualizations
                with attribution in place.
            </div>
            <div className="d-flex gap-2 flex-row align-self-center">
                <a
                    href="https://www.facebook.com/ev3treevis"
                    target="_blank"
                    aria-label="Facebook page for EV3TreeVis"
                    tabIndex={-1}
                >
                    <Facebook />
                </a>
                <a
                    href="https://www.linkedin.com/in/afarago/"
                    target="_blank"
                    aria-label="LinkedIn profile for Attila Farago"
                    tabIndex={-1}
                >
                    <Linkedin />
                </a>
                <a
                    href="mailto:attila.farago.hu+ev3treevis@gmail.com"
                    aria-label="Send email to Attila Farago"
                    tabIndex={-1}
                >
                    <EnvelopeFill />
                </a>
                {''}
                Attila Farago,
                <span title={import.meta?.env?.VITE_COMMIT_REF ?? 'development'}>
                    2025
                </span>
            </div>
        </div>
    </footer>
);

export default Footer;

// <footer className="border-top footer text-muted">
//     <div className="mx-md-5 text-center text-md-end">
//         &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a> -{' '}
