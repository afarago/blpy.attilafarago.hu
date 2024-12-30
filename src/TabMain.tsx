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

const TAB_PYCODE = 'pycode';
const TAB_PLAINCODE = 'plaincode';
const TAB_PREVIEW = 'preview';
const TAB_CALLGRAPH = 'callgraph';
const MainTab: React.FC<MainTabProps> = ({
    isInitial,
    svgContent,
    conversionResult,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
    selectedFile,
}) => {
    const [key, setKey] = useState(TAB_PYCODE);
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
                if (key === TAB_PYCODE || key === TAB_PLAINCODE) {
                    const content =
                        key === TAB_PYCODE
                            ? conversionResult?.pycode
                            : conversionResult?.plaincode;
                    navigator.clipboard.writeText(content ?? '');
                } else if (key === TAB_PREVIEW || key === TAB_CALLGRAPH) {
                    let ref: React.RefObject<HTMLDivElement | null> | undefined;
                    let ext: string;
                    if (key === TAB_PREVIEW) {
                        ref = svgRef;
                        ext = 'preview';
                    } else if (key === TAB_CALLGRAPH) {
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

    useHotkeys('control+1', () => setKey(TAB_PYCODE));
    useHotkeys('control+2', () => setKey(TAB_PLAINCODE));
    useHotkeys('control+3', () => setKey(TAB_CALLGRAPH));
    useHotkeys('control+4', () => setKey(TAB_PREVIEW));
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
        if (
            (key === TAB_PREVIEW && !svgContent) ||
            (key === TAB_PLAINCODE && !conversionResult?.plaincode)
        ) {
            setKey(TAB_PYCODE);
        }
    }, [svgContent, key]);

    return (
        !isInitial && (
            <div className="tab-main flex-column flex-fill p-2 d-flex">
                <Tab.Container
                    activeKey={key}
                    onSelect={(k) => setKey(k ?? '')}
                    defaultActiveKey={TAB_PYCODE}
                >
                    <Col>
                        <Row sm={9} style={{ zIndex: 1, position: 'relative' }}>
                            <Nav variant="tabs" className="flex-rows px-0">
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey={TAB_PYCODE}
                                        title="pycode (ctrl+1)"
                                    >
                                        Python
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item
                                    className={
                                        conversionResult?.plaincode ? '' : 'd-none'
                                    }
                                >
                                    <Nav.Link
                                        eventKey={TAB_PLAINCODE}
                                        title="pseudocode (ctrl+2)"
                                    >
                                        Pseudocode
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey={TAB_CALLGRAPH}
                                        title="call graph (ctrl+3)"
                                    >
                                        Call Graph
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className={svgContent ? '' : 'd-none'}>
                                    <Nav.Link
                                        eventKey={TAB_PREVIEW}
                                        title="preview (ctrl+4)"
                                    >
                                        Preview
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="py-2 ms-auto tabheader">
                                    {conversionResult?.additionalFields?.blockly
                                        ?.slot !== undefined && (
                                        <CatIcon
                                            slot={
                                                conversionResult?.additionalFields
                                                    ?.blockly?.slot
                                            }
                                        />
                                    )}
                                    {conversionResult?.devicetype && (
                                        <DevTypeIcon
                                            devtype={conversionResult?.devicetype}
                                        />
                                    )}
                                </Nav.Item>
                            </Nav>
                        </Row>
                        <Row sm={9} className="position-relative" style={{ top: -1 }}>
                            <Tab.Content className="h-75 border p-0 position-relative">
                                {svgContent &&
                                    [TAB_PYCODE, TAB_PLAINCODE].includes(key) && (
                                        <div
                                            className="svg-minimap mt-5 px-3 float-right"
                                            dangerouslySetInnerHTML={{
                                                __html: svgContent || '',
                                            }}
                                            onClick={() => setKey(TAB_PREVIEW)}
                                            role="presentation"
                                        ></div>
                                    )}

                                <div className="code-top-container">
                                    {key === TAB_PYCODE && (
                                        <Form.Check
                                            type="switch"
                                            id="additionalCommentsCheck" /* needed for the label to be clickable */
                                            label="Explanatory&nbsp;Comments"
                                            checked={isAdditionalCommentsChecked}
                                            title="Add explanatory comments to the source code (ctrl/cmd+e)"
                                            onChange={
                                                handleSetIsAdditionalCommentsChecked
                                            }
                                        />
                                    )}
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
                                        ) : [TAB_PREVIEW, TAB_CALLGRAPH].includes(
                                              key,
                                          ) ? (
                                            <Download />
                                        ) : (
                                            <Copy />
                                        )}
                                    </button>
                                </div>

                                {[TAB_PYCODE, TAB_PLAINCODE].map((tabKey) => (
                                    <Tab.Pane
                                        eventKey={tabKey}
                                        className={`p-4 preview-${tabKey}`}
                                        key={tabKey}
                                    >
                                        <pre>
                                            {tabKey === TAB_PYCODE &&
                                                tabKey === key &&
                                                conversionResult?.pycode}
                                            {tabKey === TAB_PLAINCODE &&
                                                tabKey === key &&
                                                conversionResult?.plaincode}
                                        </pre>
                                    </Tab.Pane>
                                ))}

                                <Tab.Pane
                                    eventKey={TAB_CALLGRAPH}
                                    className={`p-4 preview-callgraph`}
                                >
                                    {key === TAB_CALLGRAPH && (
                                        <CallGraph
                                            ref={graphRef}
                                            conversionResult={conversionResult}
                                        />
                                    )}
                                </Tab.Pane>

                                <Tab.Pane
                                    eventKey={TAB_PREVIEW}
                                    className="p-4 preview-svg"
                                >
                                    {key === TAB_PREVIEW && (
                                        <div
                                            ref={svgRef}
                                            dangerouslySetInnerHTML={{
                                                __html: svgContent || '',
                                            }}
                                        ></div>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Row>
                    </Col>
                </Tab.Container>
            </div>
        )
    );
};

export default MainTab;
