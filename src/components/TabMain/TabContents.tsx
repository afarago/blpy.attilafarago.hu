import React, { useContext, useEffect } from 'react';

import CallGraph from '../../components/CallGraph/CallGraph';
import { MyContext } from '../../contexts/MyContext';
import Panzoom from '@panzoom/panzoom';
import { Tab } from 'react-bootstrap';
import { TabKey } from './TabMain';

interface TabContentsProps {
    tabkey: string;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
}

const TabContents: React.FC<TabContentsProps> = ({ tabkey, svgRef, graphRef }) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult, svgContentData, rbfDecompileData } = context;

    const REFMAP = {
        [TabKey.PREVIEW]: { ref: svgRef, ext: 'preview' },
        [TabKey.CALLGRAPH]: { ref: graphRef, ext: 'graph' },
    } as {
        [key: string]: { ref: React.RefObject<HTMLDivElement>; ext: string };
    };

    useEffect(() => {
        const element = REFMAP[tabkey]?.ref.current;
        if (element) {
            const panzoom = Panzoom(element, {
                maxScale: 7,
            });

            element.parentElement?.addEventListener('dblclick', () => panzoom.reset());
            element.parentElement?.addEventListener('wheel', panzoom.zoomWithWheel);

            // Clean up the panzoom instance on component unmount
            return () => panzoom?.destroy();
        }
    }, [svgRef, graphRef, tabkey, REFMAP]);

    return (
        <>
            {[TabKey.PYCODE, TabKey.PLAINCODE].map((elem) => (
                <Tab.Pane
                    eventKey={elem}
                    className={`p-4 code preview-${elem}`}
                    key={elem}
                >
                    {tabkey === elem && (
                        <pre>
                            {elem === TabKey.PYCODE && conversionResult?.pycode}
                            {elem === TabKey.PLAINCODE && conversionResult?.plaincode}
                        </pre>
                    )}
                </Tab.Pane>
            ))}
            <Tab.Pane eventKey={TabKey.CALLGRAPH} className={`p-4 preview-callgraph`}>
                {tabkey === TabKey.CALLGRAPH && (
                    <CallGraph ref={graphRef} conversionResult={conversionResult} />
                )}
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
