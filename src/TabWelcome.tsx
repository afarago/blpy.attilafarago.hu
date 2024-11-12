import React from 'react';

const DummyTab: React.FC<{ isInitial: boolean }> = ({ isInitial }) => {
    return (
        <div
            className={
                'tab-welcome ' +
                (isInitial ? 'd-flex' : 'd-none') +
                ' flex-row flex-fill active py-5 mb-5'
            }
            style={{ alignItems: 'center' }}
        >
            <div className="d-flex flex-column flex-fill ustify-content-center">
                <div className="text-center mb-5">
                    <div>
                        <i
                            className="bi bi-cloud-arrow-up-fill"
                            style={{
                                fontSize: 'var(--icon-size-big)',
                                color: 'cornflowerblue',
                                lineHeight: '1em',
                            }}
                        ></i>
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
                        <i
                            className="bi bi-caret-right"
                            style={{
                                color: 'cornflowerblue',
                                fontSize: 'calc(var(--icon-size) * 0.5)',
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        ></i>
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
