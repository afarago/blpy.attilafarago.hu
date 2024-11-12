import { PyProjectResult } from 'blocklypy';
import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import classNames from 'classnames';

const MainTab: React.FC<{
    isInitial: boolean;
    svgContent?: string;
    conversionResult?: PyProjectResult;
}> = ({ isInitial, svgContent, conversionResult }) => {
    const [key, setKey] = useState('pycode');
    const [isCopying, setIsCopying] = useState(false);

    const handleCopyButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();

        const copyButton = event.currentTarget;
        const isTargetPython = copyButton.classList.contains('copy-button-pycode');
        const content = isTargetPython
            ? conversionResult?.pycode
            : conversionResult?.plaincode;
        navigator.clipboard.writeText(content ?? '');

        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);

        return false;
    };

    return (
        <div
            id="tabs-main"
            className={
                (!isInitial ? 'd-flex' : 'd-none') + ' flex-column flex-fill p-2'
            }
            style={{ minHeight: '30vh' }}
        >
            <Tab.Container
                activeKey={key}
                onSelect={(k) => setKey(k ?? '')}
                defaultActiveKey="pycode"
            >
                <Col>
                    <Row sm={9}>
                        <Nav variant="tabs" className="flex-rows px-0">
                            <Nav.Item>
                                <Nav.Link eventKey="pycode">Python</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="pseudocode">Pseudocode</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={svgContent ? '' : 'd-none'}>
                                <Nav.Link eventKey="preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className="p-2 ms-auto">
                                <svg
                                    width="20"
                                    height="20"
                                    className={
                                        conversionResult?.additionalFields?.blockly
                                            ?.slot === undefined
                                            ? 'd-none'
                                            : ''
                                    }
                                >
                                    <use
                                        href={`./static/img/cat${conversionResult?.additionalFields?.blockly?.slot}.svg#dsmIcon`}
                                        xlinkHref={`./static/img/cat${conversionResult?.additionalFields?.blockly?.slot}.svg#dsmIcon`}
                                    ></use>
                                </svg>
                                <img
                                    width="20"
                                    height="20"
                                    src={`./static/img/devtype${conversionResult?.deviceType}.png`}
                                    alt="Device type"
                                ></img>
                            </Nav.Item>
                        </Nav>
                    </Row>
                    <Row sm={9} className="position-relative" style={{ top: -1 }}>
                        <Tab.Content className="h-75 border p-0 position-relative">
                            <div
                                className={
                                    (svgContent && key !== 'preview' ? '' : 'd-none') +
                                    ' p-3 float-right svg-minimap'
                                }
                                dangerouslySetInnerHTML={{
                                    __html: svgContent || '',
                                }}
                                onClick={(e) => {
                                    setKey('preview');
                                }}
                            ></div>

                            {['pycode', 'pseudocode'].map((key) => (
                                <Tab.Pane eventKey={key} className="p-4" key={key}>
                                    <button
                                        className={classNames(
                                            'copy-button',
                                            `copy-button-${key}`,
                                            {
                                                success: isCopying,
                                            },
                                        )}
                                        onClick={handleCopyButtonClick}
                                    >
                                        <i
                                            className={classNames(
                                                'bi',
                                                { 'bi-copy': !isCopying },
                                                { 'bi-clipboard-check': isCopying },
                                            )}
                                        ></i>
                                    </button>
                                    <pre className={`preview-${key}`}>
                                        {key === 'pycode'
                                            ? conversionResult?.pycode
                                            : conversionResult?.plaincode}
                                    </pre>
                                </Tab.Pane>
                            ))}

                            <Tab.Pane eventKey="preview" className="p-4">
                                <div
                                    id="preview-svg"
                                    dangerouslySetInnerHTML={{
                                        __html: svgContent || '',
                                    }}
                                ></div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Row>
                </Col>
            </Tab.Container>
        </div>
    );
};

export default MainTab;
