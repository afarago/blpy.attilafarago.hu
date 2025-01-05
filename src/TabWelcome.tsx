import { CaretRight, CloudArrowUpFill } from 'react-bootstrap-icons';
import React, { useContext } from 'react';

import { ACCEPTED_EXTENSIONS } from './constants';
import { DevTypeIcon } from './DevTypeIcon';
import { MyContext } from './contexts/MyContext';

const icons: (React.ReactElement | string)[] = [
    'spike',
    'robotinventor',
    'ev3classroom',
    'ev3g',
    'ev3b',
    'python',
    <CaretRight key="caretright" className="tranform-caret-icon " />,
    'pybricks',
];

const WelcomeTab: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult } = context;

    return (
        !conversionResult && (
            <div className="tab-welcome flex-row flex-fill active py-5 mb-5 d-flex">
                <div className="d-flex flex-column flex-fill justify-content-center">
                    <div className="text-center mb-5">
                        <div>
                            <CloudArrowUpFill className="drop-cloud-icon" />
                        </div>
                        <div className="mb-4">
                            Imagine a world where magical unicorns transform your
                            <br />
                            LEGO blockly programs into Python code!
                        </div>
                        <div>
                            <small>
                                <i>
                                    Yes, that means all{' '}
                                    {ACCEPTED_EXTENSIONS.replaceAll('.', ' ')} files{' '}
                                </i>
                            </small>
                            <br />
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
        )
    );
};

export default WelcomeTab;
