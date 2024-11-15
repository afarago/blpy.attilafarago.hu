import { AISummary, ConversionResult } from './App';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Panzoom from '@panzoom/panzoom';
import { PyProjectResult } from 'blocklypy';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import classNames from 'classnames';
import domtoimage from 'dom-to-image';
import { useHotkeys } from 'react-hotkeys-hook';

interface MainTabProps {
    isInitial: boolean;
    svgContent?: string;
    conversionResult?: ConversionResult;
    setConversionResult?: React.Dispatch<
        React.SetStateAction<ConversionResult | undefined>
    >;
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (checked: boolean) => void;
    selectedFile?: File;
    generateCodeSummary: (result: PyProjectResult) => Promise<AISummary | undefined>;
}

const MainTab: React.FC<MainTabProps> = ({
    isInitial,
    svgContent,
    conversionResult,
    setConversionResult,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
    selectedFile,
    generateCodeSummary,
}) => {
    const [key, setKey] = useState('pycode');
    const [isCopying, setIsCopying] = useState(false);
    const svgRef = useRef<HTMLDivElement>(null);
    const svgParentRef = useRef<HTMLDivElement>(null);
    const internalUpdate = useRef(false);

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

            if (['pycode', 'pseudocode', 'aisummary'].includes(key)) {
                let content = '';
                if (key === 'pycode') {
                    content = conversionResult?.code?.pycode ?? '';
                } else if (key === 'pseudocode') {
                    content = conversionResult?.code?.plaincode ?? '';
                } else if (key === 'aisummary') {
                    content = conversionResult?.aisummary?.longsummary ?? '';
                }
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

    const changeExtension = (filename: string, newExtension: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return `${baseName}.${newExtension}`;
    };

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

    useEffect(() => {
        if (internalUpdate.current) return;
        // TODO: This is a workaround, to be removed

        if (
            key === 'aisummary' &&
            conversionResult?.code &&
            !conversionResult?.aisummary?.longsummary &&
            setConversionResult
        ) {
            generateCodeSummary(conversionResult.code).then((aisummary) => {
                const result2 = { ...conversionResult, aisummary };
                internalUpdate.current = true;
                setConversionResult(result2);
                internalUpdate.current = false;
            });
        }
    }, [conversionResult, setConversionResult, key, generateCodeSummary]);

    return (
        <div
            className={classNames('tab-main', 'flex-column', 'flex-fill', 'p-2', {
                'd-flex': !isInitial,
                'd-none': isInitial,
            })}
        >
            <div>{conversionResult?.aisummary?.shortsummary}</div>

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
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="aisummary"
                                    title="ai-summary"
                                    className={!conversionResult ? 'd-none' : ''}
                                >
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        AI Summary{' '}
                                        <img
                                            src="https://groq.com/wp-content/uploads/2024/03/PBG-mark1-color.svg"
                                            alt="Powered by Groq for fast inference."
                                            height={'16'}
                                        />
                                    </span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className="p-2 ms-auto">
                                <svg
                                    width="20"
                                    height="20"
                                    className={
                                        conversionResult?.code?.additionalFields
                                            ?.blockly?.slot === undefined
                                            ? 'd-none'
                                            : ''
                                    }
                                >
                                    <use
                                        href={`./static/img/cat${conversionResult?.code?.additionalFields?.blockly?.slot}.svg#dsmIcon`}
                                        xlinkHref={`./static/img/cat${conversionResult?.code?.additionalFields?.blockly?.slot}.svg#dsmIcon`}
                                    ></use>
                                </svg>
                                <img
                                    width="20"
                                    height="20"
                                    src={`./static/img/devtype${conversionResult?.code?.deviceType}.png`}
                                    alt="Device type"
                                ></img>
                            </Nav.Item>
                        </Nav>
                    </Row>

                    <Row sm={9} className="position-relative" style={{ top: -1 }}>
                        <Tab.Content className="border p-0 position-relative">
                            <div
                                className={classNames(
                                    'svg-minimap',
                                    'mt-5',
                                    'px-3',
                                    'float-right',
                                    {
                                        'd-none':
                                            !svgContent ||
                                            (key !== 'pycode' && key !== 'pseudocode'),
                                    },
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: svgContent || '',
                                }}
                                onClick={() => setKey('preview')}
                            ></div>

                            <div className="code-top-container">
                                <Form.Check
                                    type="switch"
                                    id="additionalCommentsCheck" /* needed for the label to be clickable */
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

                            {['pycode', 'pseudocode'].map((tabKey) => (
                                <Tab.Pane
                                    eventKey={tabKey}
                                    className={`p-4 preview-${tabKey}`}
                                    key={tabKey}
                                >
                                    <pre>
                                        {tabKey === 'pycode'
                                            ? conversionResult?.code?.pycode
                                            : conversionResult?.code?.plaincode}
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

                            <Tab.Pane eventKey="aisummary" className="p-4 d-flex">
                                <div
                                    className={
                                        'd-flex justify-content-center align-items-center flex-fill ' +
                                        (conversionResult?.aisummary !== undefined
                                            ? 'd-none'
                                            : '')
                                    }
                                >
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                </div>
                                <pre
                                    style={{ whiteSpace: 'break-spaces' }}
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            conversionResult?.aisummary?.longsummary ||
                                            '',
                                    }}
                                ></pre>
                                <a
                                    href="https://groq.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="float-end"
                                    style={{
                                        position: 'absolute',
                                        top: '3em',
                                        right: '0.5em',
                                    }}
                                >
                                    <img
                                        src="https://groq.com/wp-content/uploads/2024/03/PBG-mark1-color.svg"
                                        alt="Powered by Groq for fast inference."
                                        height={'32'}
                                    />
                                </a>
                            </Tab.Pane>
                        </Tab.Content>
                    </Row>
                </Col>
            </Tab.Container>
        </div>
    );
};

export default MainTab;
