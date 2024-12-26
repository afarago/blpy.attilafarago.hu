import { CaretRight, CloudArrowUpFill } from 'react-bootstrap-icons';

import { DevTypeIcon } from './DevTypeIcon';
import React from 'react';
import classNames from 'classnames';

const WelcomeTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
    const icons: (React.ReactElement | string)[] = [
        'spike',
        'robotinventor',
        'ev3classroom',
        'ev3g',
        'ev3b',
        <CaretRight key="caretright" className="tranform-caret-icon " />,
        'pybricks',
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
                            if (typeof icon !== 'string') {
                                return icon;
                            } else {
                                return (
                                    <DevTypeIcon
                                        key={icon}
                                        devtype={icon}
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
