import React, { useContext, useEffect } from 'react';

import CallGraph from '../../components/CallGraph/CallGraph';
import { MyContext } from '../../contexts/MyContext';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Tab } from 'react-bootstrap';
// import SyntaxHighlighter from 'react-syntax-highlighter';
import { TabKey } from './TabMain';
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import svgPanZoom from 'svg-pan-zoom';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('less', less);

interface TabContentsProps {
    tabkey: string;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
}

const TabContents: React.FC<TabContentsProps> = ({ tabkey, svgRef, graphRef }) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        conversionResult,
        svgContentData,
        svgDependencyGraph,
        rbfDecompileData,
        isCopying,
    } = context;

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

    return (
        <>
            {[TabKey.PYCODE, TabKey.PLAINCODE].map((elem) => (
                <Tab.Pane
                    eventKey={elem}
                    className={`p-4 code preview-${elem}`}
                    key={elem}
                >
                    {tabkey === elem && elem === TabKey.PYCODE && (
                        <SyntaxHighlighter language="python" style={vs}>
                            {conversionResult?.pycode || ''}
                        </SyntaxHighlighter>
                    )}
                    {tabkey === elem && elem === TabKey.PLAINCODE && (
                        <SyntaxHighlighter style={vs} language="less">
                            {conversionResult?.plaincode || ''}
                        </SyntaxHighlighter>
                    )}
                </Tab.Pane>
            ))}
            <Tab.Pane eventKey={TabKey.CALLGRAPH} className={`p-4 preview-callgraph`}>
                {tabkey === TabKey.CALLGRAPH && <CallGraph ref={graphRef} />}
            </Tab.Pane>
            <Tab.Pane eventKey={TabKey.PREVIEW} className="p-4 preview-svg">
                {tabkey === TabKey.PREVIEW && (
                    <div
                        ref={svgRef}
                        dangerouslySetInnerHTML={{ __html: svgContentData ?? '' }}
                    ></div>
                )}
            </Tab.Pane>
            <Tab.Pane
                eventKey={TabKey.EV3BDECOMPILED}
                className={`p-4 code preview-decompiled`}
            >
                {tabkey === TabKey.EV3BDECOMPILED && <pre>{rbfDecompileData}</pre>}
            </Tab.Pane>
        </>
    );
};

export default TabContents;
