import { CaretRight, CloudArrowUpFill } from 'react-bootstrap-icons';

import { DevTypeIcon } from './DevTypeIcon';
import React from 'react';
import classNames from 'classnames';

const WelcomeTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
    const icons: {
        src?: string;
        alt?: string;
        block?: React.ReactElement;
    }[] = [
        { src: 'spike' },
        { src: 'robotinventor' },
        { src: 'ev3classroom' },
        { src: 'ev3g' },
        { src: 'ev3b' },
        {
            block: <CaretRight key="caretright" className="tranform-caret-icon " />,
        },
        { src: 'pybricks' },
    ];

    return (
        <div
            className={classNames(
                'tab-welcome',
                'flex-row',
                'flex-fill',
                'active',
                'py-5',
                'mb-5',
                {
                    'd-flex': isInitial,
                    'd-none': !isInitial,
                },
            )}
        >
            <div className="d-flex flex-column flex-fill justify-content-center">
                <div className="text-center mb-5">
                    <div>
                        <CloudArrowUpFill className="drop-cloud-icon" />
                    </div>
                    <div className="mb-4">
                        Imagine a world where magical unicorns transform your
                        <br />
                        LEGO blockly programs into Python code!
                        <br />
                        (.llsp, .llsp3, .lms, .lmsp and .ev3, .rbf files are accepted)
                    </div>
                    <div>
                        {icons.map((icon, index) => {
                            if (icon.block) {
                                return icon.block;
                            } else {
                                return (
                                    <DevTypeIcon
                                        key={icon.src}
                                        devtype={icon.src}
                                        className="icon"
                                    />
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTab;
