import { CaretRight, CloudArrowUpFill } from 'react-bootstrap-icons';
import React, { useContext } from 'react';

import { ACCEPTED_EXTENSIONS } from '../../utils/constants';
import { DevTypeIcon } from '../Icons/DevTypeIcon';
import { MyContext } from '../../contexts/MyContext';

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
    const { conversionResult, fileInputRef } = context;

    const handleCloudIconClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        !conversionResult && (
            <div className="tab-welcome active">
                <div className="justify-content-center">
                    <div className="text-center">
                        <div>
                            <button onClick={handleCloudIconClick}>
                                <CloudArrowUpFill className="drop-cloud-icon" />
                            </button>
                        </div>
                        <div className="mb-4 d-flex flex-column align-items-center">
                            <div style={{ maxWidth: '30em' }}>
                                Imagine a world where magical unicorns transform your
                                LEGO blockly programs into Python code!
                            </div>
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
