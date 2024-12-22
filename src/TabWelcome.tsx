import React from 'react';
import classNames from 'classnames';

const WelcomeTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
    const icons: { src?: string; alt?: string; block?: React.ReactElement }[] = [
        { src: './static/img/devtype_spike.png', alt: 'LEGO SPIKE' },
        { src: './static/img/devtype_robotinventor.png', alt: 'LEGO Robot Inventor' },
        { src: './static/img/devtype_ev3classroom.png', alt: 'LEGO EV3 Classroom' },
        { src: './static/img/devtype_ev3g.png', alt: 'LEGO EV3 Lab' },
        { src: './static/img/devtype_ev3b.png', alt: 'LEGO EV3 Lab Binary' },
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
                        (.llsp, .llsp3, .lms, .lmsp and .ev3, .rbf files are accepted)
                    </div>
                    <div>
                        {icons.map((icon, index) => {
                            if (icon.block) {
                                return icon.block;
                            } else {
                                return (
                                    <img
                                        key={icon.src}
                                        src={icon.src}
                                        className="icon"
                                        alt={icon.alt}
                                        title={icon.alt}
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
