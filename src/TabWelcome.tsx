import classNames from 'classnames';
import React from 'react';

const DummyTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
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
            <div className="d-flex flex-column flex-fill ustify-content-center">
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
                        <img
                            src="./static/img/devtype1.png"
                            className="icon"
                            alt="LEGO SPIKE"
                        />
                        <img
                            src="./static/img/devtype2.png"
                            className="icon"
                            alt="LEGO Robot Inventor"
                        />
                        <img
                            src="./static/img/devtype3.png"
                            className="icon"
                            alt="LEGO EV3 Classroom"
                        />
                        <img
                            src="./static/img/devtype4.png"
                            className="icon"
                            alt="LEGO EV3 Lab"
                        />
                        <i className="tranform-caret-icon bi bi-caret-right"></i>
                        <img
                            src="./static/img/devtype_pybricks.png"
                            className="icon"
                            alt="Pybricks"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DummyTab;
