import { ITabElem, TabKey } from './TabMain';
import React, { useContext, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import CallGraph from '../../components/CallGraph/CallGraph';
import { MyContext } from '../../contexts/MyContext';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Tab } from 'react-bootstrap';
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import svgPanZoom from 'svg-pan-zoom';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// import SyntaxHighlighter from 'react-syntax-highlighter';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('less', less);

interface TabContentsProps {
    tabkey: string;
    setTabkey: (key: string) => void;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
    tabElems: ITabElem[];
}

const TabContents: React.FC<TabContentsProps> = ({
    tabkey,
    setTabkey,
    svgRef,
    graphRef,
    tabElems,
}) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { svgContentData, svgDependencyGraph, rbfDecompileData, isCopying } = context;

    const REFMAP = {
        [TabKey.PREVIEW]: { ref: svgRef, ext: 'preview' },
        [TabKey.CALLGRAPH]: { ref: graphRef, ext: 'graph' },
    } as {
        [key: string]: { ref: React.RefObject<HTMLDivElement>; ext: string };
    };

    let panzoom: SvgPanZoom.Instance | undefined;
    useEffect(() => {
        const element = REFMAP[tabkey]?.ref.current;

        // let observer: MutationObserver | undefined;);
        const svgelement = element?.querySelector<HTMLElement>('svg, div>svg'); //!! svg
        if (svgelement) {
            panzoom = svgPanZoom(svgelement, {
                zoomScaleSensitivity: 0.5,
                controlIconsEnabled: !isCopying,
                // mouseWheelZoomEnabled: true,
                // panEnabled: true,
                // zoomEnabled: true,
                // contain: true,
                // fit: true,
            });
        }

        return () => {
            panzoom?.destroy();
        };
    }, [
        svgRef,
        graphRef,
        svgContentData,
        svgDependencyGraph,
        tabkey,
        REFMAP,
        isCopying,
    ]);

    function createTabElemContent(key: string) {
        for (const elem of tabElems) {
            if (!key.startsWith(elem.key)) continue;

            let subindex = elem.children ? Number(key.split(':')[1]) : 0;
            if (isNaN(subindex)) subindex = 0;
            const code = elem.children ? elem.children?.[subindex]?.code : elem.code;

            return (
                <>
                    {/* Header for the multi-file setup - filename */}
                    {elem.key === TabKey.PYCODE && elem.children && (
                        <div className="multi-file-header bg-secondary text-white small">
                            {elem.children.map((child2, index2) => (
                                <Button
                                    size="sm"
                                    className={
                                        child2.key === key
                                            ? 'active'
                                            : 'border-end border-start'
                                    }
                                    variant="secondary"
                                    key={child2.key}
                                    onClick={() => setTabkey(child2.key)}
                                >
                                    {child2?.name}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <Tab.Pane
                        eventKey={key}
                        className={`p-4 content-${elem.key}`}
                        key={key}
                    >
                        {(elem.key === TabKey.PYCODE ||
                            key === TabKey.PLAINCODE ||
                            key === TabKey.EV3BDECOMPILED) && (
                            <SyntaxHighlighter
                                style={vs}
                                language={
                                    elem.key === TabKey.PYCODE ? 'python' : 'less'
                                }
                            >
                                {code ?? ''}
                            </SyntaxHighlighter>
                        )}
                        {key === TabKey.CALLGRAPH && <CallGraph ref={graphRef} />}
                        {key === TabKey.PREVIEW && (
                            <div
                                ref={svgRef}
                                dangerouslySetInnerHTML={{
                                    __html: svgContentData ?? '',
                                }}
                            ></div>
                        )}
                    </Tab.Pane>
                </>
            );
        }
    }

    return createTabElemContent(tabkey);
};

export default TabContents;
