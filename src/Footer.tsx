import {
    Envelope,
    EnvelopeFill,
    Facebook,
    Linkedin,
    Mailbox,
} from 'react-bootstrap-icons';

import { GITHUB_VERSION } from './github_version';
import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-top footer text-muted py-2">
        <div className="container text-center">
            <div className="small text-muted">
                No robots were harmed in making this converter and visualizer of LEGO
                SPIKE and EV3 robot files. News and updates are available on the
                <a href="https://www.facebook.com/ev3treevis">facebook page</a>,
                open-source on{' '}
                <a href="https://github.com/afarago/blpy.attilafarago.hu">GitHub</a> and{' '}
                <a href="https://www.npmjs.com/package/blocklypy">npm</a>. You might
                freely use, share any generated artifacts, visualizations with
                attribution in place.
            </div>
            <div className="d-inline-flex gap-2 mx-md-5 text-center text-md-end">
                <a href="https://www.facebook.com/ev3treevis">
                    <Facebook />
                </a>
                <a href="https://www.linkedin.com/in/afarago/">
                    <Linkedin />
                </a>
                <a href="mailto:attila.farago.hu+ev3treevis@gmail.com">
                    <EnvelopeFill />
                </a>
                Attila Farago,
                <span title={GITHUB_VERSION}>2025</span>
            </div>
        </div>
    </footer>
);

export default Footer;

// <footer className="border-top footer text-muted">
//     <div className="mx-md-5 text-center text-md-end">
//         &copy; Attila Faragó - <a href="https://github.com/afarago">@afarago</a> -{' '}
