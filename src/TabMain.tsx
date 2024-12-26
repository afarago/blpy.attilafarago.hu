import { CheckLg, Copy, Download } from 'react-bootstrap-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import CallGraph from './CallGraph';
import { CatIcon } from './CatIcon';
import Col from 'react-bootstrap/Col';
import { DevTypeIcon } from './DevTypeIcon';
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
    conversionResult?: PyProjectResult;
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (checked: boolean) => void;
    selectedFile?: File;
}

const MainTab: React.FC<MainTabProps> = ({
    isInitial,
    svgContent,
    conversionResult,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
    selectedFile,
}) => {
    const [key, setKey] = useState('pycode');
    const [isCopying, setIsCopying] = useState(false);
    const svgRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef(null);

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

            try {
                setIsCopying(true);
                if (key === 'pycode' || key === 'pseudocode') {
                    const content =
                        key === 'pycode'
                            ? conversionResult?.pycode
                            : conversionResult?.plaincode;
                    navigator.clipboard.writeText(content ?? '');
                } else if (key === 'preview' || key === 'callgraph') {
                    let ref: React.RefObject<HTMLDivElement | null> | undefined;
                    let ext: string;
                    if (key === 'preview') {
                        ref = svgRef;
                        ext = 'preview';
                    } else if (key === 'callgraph') {
                        ref = graphRef;
                        ext = 'graph';
                    }
                    if (!ref?.current || !selectedFile) return;
                    // domtoimage.toBlob(svgRef.current, {}).then((data: Blob) => {
                    //     // copy image to clipboard
                    //     const data2 = [new ClipboardItem({ 'image/png': data })];
                    //     navigator.clipboard.write(data2);
                    // });
                    domtoimage.toPng(ref.current, {}).then((dataUrl: string) => {
                        // download png file
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        link.download = `${getBaseName(selectedFile.name)}_${ext}.png`;
                        // navigator.clipboard.writeText(dataUrl);
                        link.click();
                    });
                }
            } catch (e) {
                console.error('::ERROR::', e);
            } finally {
                setTimeout(() => setIsCopying(false), 1000);
            }

            return false;
        },
        [conversionResult, key, svgRef, selectedFile],
    );

    const getBaseName = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return baseName;
    };

    useHotkeys('control+1', () => setKey('pycode'));
    useHotkeys('control+2', () => setKey('pseudocode'));
    useHotkeys('control+3', () => setKey('callgraph'));
    useHotkeys('control+4', () => setKey('preview'));
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
    }, [svgRef, key]);

    useEffect(() => {
        if (!svgContent && key === 'preview') {
            setKey('pycode');
        }
    }, [svgContent, key]);

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
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="callgraph"
                                    title="call graph (ctrl+3)"
                                >
                                    Call Graph
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={svgContent ? '' : 'd-none'}>
                                <Nav.Link eventKey="preview" title="preview (ctrl+4)">
                                    Preview
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className="py-2 ms-auto tabheader">
                                <CatIcon
                                    slot={
                                        conversionResult?.additionalFields?.blockly
                                            ?.slot
                                    }
                                />
                                <DevTypeIcon
                                    devtype={conversionResult?.devicetype}
                                    className={conversionResult ? '' : 'd-none'}
                                />
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
                                    {
                                        'd-none':
                                            !svgContent ||
                                            ['preview', 'callgraph'].includes(key),
                                    },
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: svgContent || '',
                                }}
                                onClick={() => setKey('preview')}
                                role="presentation"
                            ></div>

                            <div className="code-top-container">
                                <Form.Check
                                    type="switch"
                                    id="additionalCommentsCheck" /* needed for the label to be clickable */
                                    label="Explanatory&nbsp;Comments"
                                    checked={isAdditionalCommentsChecked}
                                    title="Add explanatory comments to the source code (ctrl/cmd+e)"
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
                                    {isCopying ? (
                                        <CheckLg />
                                    ) : ['preview', 'callgraph'].includes(key) ? (
                                        <Download />
                                    ) : (
                                        <Copy />
                                    )}
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
                                            ? conversionResult?.pycode
                                            : conversionResult?.plaincode}
                                    </pre>
                                </Tab.Pane>
                            ))}

                            <Tab.Pane
                                eventKey="callgraph"
                                className={`p-4 preview-callgraph`}
                            >
                                <CallGraph
                                    ref={graphRef}
                                    conversionResult={conversionResult}
                                />
                            </Tab.Pane>

                            <Tab.Pane eventKey="preview" className="p-4 preview-svg">
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
