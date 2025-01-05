import {
    BookHalf,
    CheckLg,
    CodeSlash,
    Copy,
    Diagram2,
    Download,
    FileEarmarkImage,
    FiletypePy,
} from 'react-bootstrap-icons';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import CallGraph from './CallGraph';
import { CatIcon } from './CatIcon';
import Col from 'react-bootstrap/Col';
import { DevTypeIcon } from './DevTypeIcon';
import Form from 'react-bootstrap/Form';
import { MyContext } from './contexts/MyContext';
import Nav from 'react-bootstrap/Nav';
import Panzoom from '@panzoom/panzoom';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import domtoimage from 'dom-to-image';
import { useHotkeys } from 'react-hotkeys-hook';

const TAB_PYCODE = 'pycode';
const TAB_PLAINCODE = 'plaincode';
const TAB_EV3BDECOMPILED = 'ev3b_decompiled';
const TAB_PREVIEW = 'preview';
const TAB_CALLGRAPH = 'callgraph';

const MainTab: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        filename,
        conversionResult,
        isAdditionalCommentsChecked,
        setIsAdditionalCommentsChecked,
    } = context;

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

    const REFMAP = {
        [TAB_PREVIEW]: { ref: svgRef, ext: 'preview' },
        [TAB_CALLGRAPH]: { ref: graphRef, ext: 'graph' },
    };
    const handleCopyButtonClick = useCallback(
        (event?: React.MouseEvent<HTMLButtonElement>) => {
            event?.stopPropagation();
            event?.preventDefault();

            try {
                if (!conversionResult || !conversionResult || !filename) return;

                setIsCopying(true);
                let textcontent: string | undefined;
                switch (key) {
                    case TAB_PYCODE:
                    case TAB_PLAINCODE:
                        textcontent = conversionResult[key];
                        navigator.clipboard.writeText(textcontent ?? '');
                        break;

                    case TAB_EV3BDECOMPILED:
                        textcontent = rbfDecompileData();
                        navigator.clipboard.writeText(textcontent ?? '');
                        break;

                    case TAB_PREVIEW:
                    case TAB_CALLGRAPH:
                        const { ref, ext } = REFMAP[key];
                        // let ref: React.RefObject<HTMLDivElement | null> | undefined;
                        // let ext: string;
                        // if (key === TAB_PREVIEW) {
                        //     ref = svgRef;
                        //     ext = 'preview';
                        // } else if (key === TAB_CALLGRAPH) {
                        //     ref = graphRef;
                        //     ext = 'graph';
                        // }
                        if (!ref?.current) return;

                        // domtoimage.toBlob(svgRef.current, {}).then((data: Blob) => {
                        //     // copy image to clipboard
                        //     const data2 = [new ClipboardItem({ 'image/png': data })];
                        //     navigator.clipboard.write(data2);
                        // });

                        domtoimage
                            .toBlob(ref.current, {})
                            .then((blob: Blob) => {
                                const dataUrl = URL.createObjectURL(blob); // Create a temporary URL for the image data

                                // Proceed with download using the temporary URL
                                const link = document.createElement('a');
                                link.href = dataUrl;
                                link.download = `${getBaseName(filename)}_${ext}.png`;
                                link.click();

                                // Important: Release the object URL when it's no longer needed to avoid memory leaks
                                URL.revokeObjectURL(dataUrl); // Release the temporary URL after the download
                            })
                            .catch((error) => {
                                console.error('Error capturing image:', error);
                            });

                        // domtoimage
                        //     .toPng(ref.current, {})
                        //     .then((dataUrl: string) => {
                        //         const link = document.createElement('a');
                        //         link.href = dataUrl;
                        //         link.download = `${getBaseName(filename)}_${ext}.png`;
                        //         link.click();
                        //         URL.revokeObjectURL(dataUrl);
                        //     })
                        //     .catch((error) => {
                        //         console.error('Error capturing image:', error);
                        //     });
                        break;
                }
            } catch (e) {
                console.error('::ERROR::', e);
            } finally {
                setTimeout(() => setIsCopying(false), 1000);
            }

            return false;
        },
        [conversionResult, key, svgRef, filename, REFMAP, rbfDecompileData],
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

    function svgContentData() {
        return conversionResult?.extra?.['blockly.svg'];
    }
    function rbfDecompileData() {
        return conversionResult?.extra?.['ev3b.decompiled'];
    }
    function isInitialState() {
        return conversionResult === undefined;
    }

    useEffect(() => {
        if (
            (key === TAB_PREVIEW && !svgContentData()) ||
            (key === TAB_PLAINCODE && !conversionResult?.plaincode) ||
            (key === TAB_EV3BDECOMPILED && !rbfDecompileData())
        ) {
            setKey(TAB_PYCODE);
        }
    }, [conversionResult, key]);

    const tabListHeaders = [
        {
            key: TAB_PYCODE,
            title: 'pycode (ctrl+1)',
            icon: FiletypePy,
            name: 'Python',
            condition: true,
        },
        {
            key: TAB_PLAINCODE,
            title: 'pseudocode (ctrl+2)',
            icon: CodeSlash,
            name: 'Pseudocode',
            condition: conversionResult?.plaincode !== undefined,
        },
        {
            key: TAB_EV3BDECOMPILED,
            title: 'decompiled',
            icon: BookHalf,
            name: 'Decompiled RBF',
            condition: !!rbfDecompileData(),
        },
        {
            key: TAB_CALLGRAPH,
            title: 'call graph (ctrl+3)',
            icon: Diagram2,
            name: 'Call Graph',
            condition: !!conversionResult?.dependencygraph,
        },
        {
            key: TAB_PREVIEW,
            title: 'preview (ctrl+4)',
            icon: FileEarmarkImage,
            name: 'Preview',
            condition: !!svgContentData(),
        },
    ];

    return (
        !isInitialState() && (
            <div className="tab-main flex-column flex-fill p-2 d-flex">
                <Tab.Container
                    activeKey={key}
                    onSelect={(k) => setKey(k ?? '')}
                    defaultActiveKey={TAB_PYCODE}
                >
                    <Col>
                        {/* Tab Headers top line */}
                        <Row sm={9}>
                            <Nav variant="tabs" className="flex-rows px-0">
                                {/* Tab headers */}
                                {tabListHeaders.map(
                                    (elem) =>
                                        elem.condition && (
                                            <Nav.Item key={elem.key}>
                                                <Nav.Link
                                                    eventKey={elem.key}
                                                    title={`${elem.title}`}
                                                    className="icon-link icon-link-hover"
                                                >
                                                    <elem.icon className="d-none d-md-inline" />
                                                    {elem.name}
                                                </Nav.Link>
                                            </Nav.Item>
                                        ),
                                )}

                                {/* Extra icons */}
                                <Nav.Item className="py-2 ms-auto tabheader">
                                    {conversionResult?.extra?.['blockly.slot'] !==
                                        undefined && (
                                        <CatIcon
                                            slot={
                                                conversionResult?.extra?.[
                                                    'blockly.slot'
                                                ]
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

                        {/* Tab Contents */}
                        <Row sm={9} className="position-relative">
                            <Tab.Content className="h-75 border p-0 position-relative">
                                {/* Mini-map */}
                                {svgContentData() &&
                                    [TAB_PYCODE, TAB_PLAINCODE].includes(key) && (
                                        <div
                                            className="svg-minimap mt-5 px-3 float-right"
                                            dangerouslySetInnerHTML={{
                                                __html: svgContentData() || '',
                                            }}
                                            onClick={() => setKey(TAB_PREVIEW)}
                                            role="presentation"
                                        ></div>
                                    )}

                                {/* Top header - explanatiory comments; copy controls */}
                                <div className="code-top-container">
                                    {key === TAB_PYCODE &&
                                        conversionResult?.devicetype !== 'python' && (
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
                                        className={`copy-button copy-button-${key} ${
                                            isCopying ? 'success' : ''
                                        }`}
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
                                        className={`p-4 code preview-${tabKey}`}
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
                                                __html: svgContentData() || '',
                                            }}
                                        ></div>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane
                                    eventKey={TAB_EV3BDECOMPILED}
                                    className={`p-4 code preview-decompiled`}
                                >
                                    {key === TAB_EV3BDECOMPILED && (
                                        <pre>{rbfDecompileData()}</pre>
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
