import React, { useCallback } from 'react';
import { CaretRight, CloudArrowUpFill } from 'react-bootstrap-icons';

import { selectConversion } from '@/features/conversion/conversionSlice';
import { DevTypeIcon } from '@/features/icons/DevTypeIcon';
import { ACCEPTED_EXTENSIONS } from '@/utils/constants';
import { useSelector } from 'react-redux';

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

const WelcomeTab: React.FC<{
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ fileInputRef }) => {
    const { conversionResult } = useSelector(selectConversion);

    const handleCloudIconClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>): void => {
            event.preventDefault();
            if (fileInputRef?.current) fileInputRef?.current.click();
        },
        [fileInputRef],
    );

    return (
        !conversionResult && (
            <div className="tab-welcome active">
                <div className="justify-content-center">
                    <div className="text-center">
                        <button onClick={handleCloudIconClick}>
                            <CloudArrowUpFill className="drop-cloud-icon" />
                        </button>
                        <div className="mb-4 mx-auto" style={{ maxWidth: '30em' }}>
                            Imagine a world where magical unicorns transform your LEGO
                            blockly programs into Python code!
                        </div>
                        <small>
                            <i>
                                Yes, that means all{' '}
                                {ACCEPTED_EXTENSIONS.replaceAll('.', ' ')} files from
                                your computer and from github
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
        )
    );
};

export default WelcomeTab;
