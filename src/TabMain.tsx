import { PyProjectResult } from 'blocklypy';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import classNames from 'classnames';
import Form from 'react-bootstrap/Form';
import { useHotkeys } from 'react-hotkeys-hook';
import domtoimage from 'dom-to-image';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';

const MainTab: React.FC<{
    isInitial: boolean;
    svgContent?: string;
    conversionResult?: PyProjectResult;
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (checked: boolean) => void;
    selectedFile?: File;
}> = ({
    isInitial,
    svgContent,
    conversionResult,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
    selectedFile,
}) => {
    const [key, setKey] = useState('pycode');
    const [isCopying, setIsCopying] = useState(false);
    const svgRef = useRef(null);
    const svgParentRef = useRef(null);

    const handleSetIsAdditionalCommentsChecked = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            setIsAdditionalCommentsChecked(event.target.checked),
        [setIsAdditionalCommentsChecked],
    );

    const toggleIsAdditionalCommentsChecked = useCallback(() => {
        setIsAdditionalCommentsChecked(!isAdditionalCommentsChecked);
    }, [setIsAdditionalCommentsChecked, isAdditionalCommentsChecked]);

    const handleCopyButtonClick = useCallback(
        (event?: React.MouseEvent<HTMLButtonElement>) => {
            event?.stopPropagation();
            event?.preventDefault();

            if (key === 'pycode' || key === 'pseudocode') {
                const content =
                    key === 'pycode'
                        ? conversionResult?.pycode
                        : conversionResult?.plaincode;
                navigator.clipboard.writeText(content ?? '');
            } else if (key === 'preview') {
                if (!svgRef.current || !selectedFile) return;
                // domtoimage.toBlob(svgRef.current, {}).then((data: Blob) => {
                //     // copy image to clipboard
                //     const data2 = [new ClipboardItem({ 'image/png': data })];
                //     navigator.clipboard.write(data2);
                // });
                domtoimage.toPng(svgRef.current, {}).then((dataUrl: string) => {
                    // download png file
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = changeExtension(selectedFile.name, 'png');
                    navigator.clipboard.writeText(dataUrl);
                    link.click();
                });
            }

            setIsCopying(true);
            setTimeout(() => setIsCopying(false), 1000);

            return false;
        },
        [conversionResult, key, svgRef, selectedFile],
    );

    function changeExtension(filename: string, newExtension: string): string {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return `${baseName}.${newExtension}`;
    }

    useHotkeys('control+1', () => setKey('pycode'));
    useHotkeys('control+2', () => setKey('pseudocode'));
    useHotkeys('control+3', () => setKey('preview'));
    useHotkeys(
        'mod+e',
        () => toggleIsAdditionalCommentsChecked(),
        { preventDefault: true },
        [setIsAdditionalCommentsChecked, isAdditionalCommentsChecked],
    );
    useHotkeys('mod+c', () => handleCopyButtonClick(), { preventDefault: true }, [
        conversionResult,
        key,
    ]);

    useEffect(() => {
        if (key === 'preview') {
            const element = svgRef.current as unknown as HTMLElement;
            if (element) {
                const panzoom = Panzoom(element, {
                    maxScale: 5,
                });

                // button.addEventListener('click', panzoom.zoomIn);
                element.parentElement?.addEventListener('wheel', panzoom.zoomWithWheel);

                // Clean up the panzoom instance on component unmount
                return () => panzoom?.destroy();
            }
        }
    }, [svgParentRef, key]);

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
                    <Row sm={9} style={{ zIndex: 1, position: 'relative' }}>
                        <Nav variant="tabs" className="flex-rows px-0">
                            <Nav.Item>
                                <Nav.Link eventKey="pycode" title="pycode (ctrl+1)">
                                    Python
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="pseudocode"
                                    title="pseudocode (ctrl+2)"
                                >
                                    Pseudocode
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={svgContent ? '' : 'd-none'}>
                                <Nav.Link eventKey="preview" title="preview (ctrl+3)">
                                    Preview
                                </Nav.Link>
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

                            <div className="code-top-container">
                                <Form.Check
                                    type="switch"
                                    id="additionalCommentsCheck" // needed for the label to be clickable
                                    label="Explanatory&nbsp;Comments"
                                    checked={isAdditionalCommentsChecked}
                                    title="Explanatory Comments (ctrl/cmd+e)"
                                    className={classNames({
                                        'd-none': key !== 'pycode',
                                    })}
                                    onChange={handleSetIsAdditionalCommentsChecked}
                                />
                                <button
                                    className={classNames(
                                        'copy-button',
                                        `copy-button-${key}`,
                                        {
                                            success: isCopying,
                                        },
                                    )}
                                    onClick={handleCopyButtonClick}
                                    title="Copy code (ctrl/cmd+c)"
                                >
                                    <i
                                        className={classNames('bi', {
                                            'bi-copy': !isCopying && key !== 'preview',
                                            'bi-download':
                                                !isCopying && key === 'preview',
                                            'bi-check-lg': isCopying,
                                        })}
                                    ></i>
                                </button>
                            </div>

                            {['pycode', 'pseudocode'].map((key) => (
                                <Tab.Pane
                                    eventKey={key}
                                    className={`p-4 preview-${key}`}
                                    key={key}
                                >
                                    <pre>
                                        {key === 'pycode'
                                            ? conversionResult?.pycode
                                            : conversionResult?.plaincode}
                                    </pre>
                                </Tab.Pane>
                            ))}

                            <Tab.Pane
                                eventKey="preview"
                                className="p-4 preview-svg"
                                ref={svgParentRef}
                            >
                                <div
                                    ref={svgRef}
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
