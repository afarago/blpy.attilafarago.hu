import { PyProjectResult } from 'blocklypy';
import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import classNames from 'classnames';
import Form from 'react-bootstrap/Form';

const MainTab: React.FC<{
    isInitial: boolean;
    svgContent?: string;
    conversionResult?: PyProjectResult;
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (checked: boolean) => void;
}> = ({
    isInitial,
    svgContent,
    conversionResult,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
}) => {
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
            className={classNames('tab-main', 'flex-column', 'flex-fill', 'p-2', {
                'd-flex': !isInitial,
                'd-none': isInitial,
            })}
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
                    <Row
                        sm={9}
                        className="position-relative"
                        style={{ top: -1, zIndex: -1 }}
                    >
                        <Tab.Content className="h-75 border p-0 position-relative">
                            <div
                                className={classNames(
                                    'svg-minimap',
                                    'mt-5',
                                    'px-3',
                                    'float-right',
                                    { 'd-none': !svgContent || key === 'preview' },
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: svgContent || '',
                                }}
                                onClick={(e) => {
                                    setKey('preview');
                                }}
                            ></div>

                            {['pycode', 'pseudocode'].map((key) => (
                                <Tab.Pane
                                    eventKey={key}
                                    className={`p-4 preview-${key}`}
                                    key={key}
                                >
                                    <div className="code-top-container">
                                        <small
                                            className={classNames({
                                                'd-none': key !== 'pycode',
                                            })}
                                        >
                                            <Form.Check
                                                type="switch"
                                                id="additionalCommentsCheck" // needed for the label to be clickable
                                                label="Explanatory&nbsp;Comments"
                                                checked={isAdditionalCommentsChecked}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    setIsAdditionalCommentsChecked(
                                                        event.target.checked,
                                                    )
                                                }
                                            />
                                        </small>
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
                                                className={classNames('bi', {
                                                    'bi-copy': !isCopying,
                                                    'bi-clipboard-check': isCopying,
                                                })}
                                            ></i>
                                        </button>
                                    </div>
                                    <pre>
                                        {key === 'pycode'
                                            ? conversionResult?.pycode
                                            : conversionResult?.plaincode}
                                    </pre>
                                </Tab.Pane>
                            ))}

                            <Tab.Pane eventKey="preview" className="p-4 preview-svg">
                                <div
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
