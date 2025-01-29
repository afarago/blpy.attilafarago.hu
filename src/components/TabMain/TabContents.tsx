import { ITabElem, TabKey } from './TabMain';
import React, { useContext, useEffect, useState } from 'react';

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
    genkey: string;
    gensubkey?: string;
    selectedTabkey: string;
    setSelectedTabkey: (key: string) => void;
    selectedSubTabkey: string;
    setSelectedSubTabkey: (key: string) => void;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
    tabElems: ITabElem[];
}

const TabContents: React.FC<TabContentsProps> = ({
    genkey,
    gensubkey,
    selectedTabkey,
    setSelectedTabkey,
    selectedSubTabkey,
    setSelectedSubTabkey,
    svgRef,
    graphRef,
    tabElems,
}) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { svgContentData, svgDependencyGraph, isCopying } = context;

    const REFMAP = {
        [TabKey.PREVIEW]: { ref: svgRef, ext: 'preview' },
        [TabKey.CALLGRAPH]: { ref: graphRef, ext: 'graph' },
    } as {
        [key: string]: { ref: React.RefObject<HTMLDivElement>; ext: string };
    };

    let panzoom: SvgPanZoom.Instance | undefined;
    useEffect(() => {
        const element = REFMAP[genkey]?.ref.current;

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
            try {
                panzoom?.destroy();
            } catch {}
        };
    }, [
        svgRef,
        graphRef,
        svgContentData,
        svgDependencyGraph,
        genkey,
        gensubkey,
        selectedTabkey,
        REFMAP,
        isCopying,
    ]);

    function createTabElemContent() {
        const elem = tabElems.find((elem) => genkey === elem.key);
        if (!elem) return null;

        {
            let subelem: ITabElem | undefined = elem;
            let code = elem.code;
            let index = 0;
            if (elem.children) {
                index = elem.children.findIndex((elem) => elem.name === gensubkey);
                subelem = elem.children[index];
                code = subelem?.code;
            }

            return (
                <>
                    {/* Header for the multi-file setup - filename - show only when in PYCODE mode */}
                    {genkey === TabKey.PYCODE && index === 0 && elem.children && (
                        <div
                            className={
                                'multi-file-header bg-secondary text-white small' +
                                (selectedTabkey === TabKey.PYCODE ? '' : ' d-none')
                            }
                        >
                            {elem.children.map((child2, index2) => (
                                <Button
                                    size="sm"
                                    className={
                                        child2.key === selectedSubTabkey
                                            ? 'active'
                                            : 'border-end border-start'
                                    }
                                    variant="secondary"
                                    key={child2.key}
                                    onClick={() => setSelectedSubTabkey(child2.key)}
                                >
                                    {child2?.name}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <Tab.Pane
                        eventKey={genkey}
                        className={
                            `p-4 content-${genkey}` +
                            (!elem.children || selectedSubTabkey === gensubkey
                                ? ''
                                : ' d-none')
                        }
                        key={genkey}
                    >
                        {(genkey === TabKey.PYCODE ||
                            genkey === TabKey.PLAINCODE ||
                            genkey === TabKey.EV3BDECOMPILED) && (
                            <SyntaxHighlighter
                                style={vs}
                                language={genkey === TabKey.PYCODE ? 'python' : 'less'}
                            >
                                {code ?? ''}
                            </SyntaxHighlighter>
                        )}
                        {genkey === TabKey.CALLGRAPH && <CallGraph ref={graphRef} />}
                        {genkey === TabKey.PREVIEW && (
                            <div
                                ref={svgRef}
                                dangerouslySetInnerHTML={{
                                    __html: svgContentData ?? '',
                                }}
                            />
                        )}
                    </Tab.Pane>
                </>
            );
        }
    }

    return createTabElemContent();
};

export default TabContents;
