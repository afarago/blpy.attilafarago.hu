import React from 'react';
import classNames from 'classnames';

const WelcomeTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
    const icons: { src?: string; alt?: string; block?: JSX.Element }[] = [
        { src: './static/img/devtype1.png', alt: 'LEGO SPIKE' },
        { src: './static/img/devtype2.png', alt: 'LEGO Robot Inventor' },
        { src: './static/img/devtype3.png', alt: 'LEGO EV3 Classroom' },
        { src: './static/img/devtype4.png', alt: 'LEGO EV3 Lab' },
        {
            block: (
                <i key="caret" className="tranform-caret-icon bi bi-caret-right"></i>
            ),
        },
        { src: './static/img/devtype_pybricks.png', alt: 'Pybricks' },
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
                        <i className="drop-cloud-icon bi bi-cloud-arrow-up-fill"></i>
                    </div>
                    <div className="mb-4">
                        Imagine a world where magical unicorns transform your
                        <br />
                        LEGO blockly programs into Python code!
                        <br />
                        (.llsp, .llsp3, .lms, .lmsp and .ev3 files are accepted)
                    </div>
                    <div>
                        {icons.map((icon, index) => {
                            if (icon.block) {
                                return icon.block;
                            } else {
                                return (
                                    <img
                                        key={index}
                                        src={icon.src}
                                        className="icon"
                                        alt={icon.alt}
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
