import { ITabElem, TabKey } from './TabMain';
import React, { useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import CallGraph from '@/features/graph/CallGraph';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import Tab from 'react-bootstrap/Tab';
import { fileSetEnabled } from '@/features/fileContent/fileContentSlice';
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { selectSvgContentData } from '@/features/conversion/conversionSlice';
import { selectTabs } from './tabsSlice';
import svgPanZoom from 'svg-pan-zoom';
// import SyntaxHighlighter from 'react-syntax-highlighter';
import { useAppDispatch } from '@/app/hooks';
import { useSelector } from 'react-redux';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
    const { copying } = useSelector(selectTabs);
    const svgContentData = useSelector(selectSvgContentData);
    const dispatch = useAppDispatch();

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
                controlIconsEnabled: !copying,
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
        genkey,
        gensubkey,
        selectedTabkey,
        REFMAP,
        copying,
    ]);

    const handleToggleFileDisabled = (e: React.MouseEvent, filename: string) => {
        e.preventDefault();
        dispatch(fileSetEnabled({ filename, enabled: undefined }));
    };

    const elem = tabElems.find((elem) => elem.key === selectedTabkey);
    function createTabElemContent(elem: ITabElem) {
        let code = elem.code;
        let index = 0;
        if (elem.children) {
            index = elem.children.findIndex((elem) => elem.name === gensubkey);
            const subelem = elem.children[index];
            code = subelem?.disabled ? '[tab disabled]' : subelem?.code;
        }

        return (
            <>
                {/* Header for the multi-file setup - filename - show only when in PYCODE mode */}
                {genkey === TabKey.PYCODE && index === 0 && elem.children && (
                    <div
                        className={
                            'multi-file-header bg-light text-white small' +
                            (selectedTabkey === TabKey.PYCODE ? '' : ' d-none')
                        }
                    >
                        {elem.children.map((child2) => (
                            <Button
                                size="sm"
                                className={
                                    (child2.key === selectedSubTabkey ? 'active' : '') +
                                    (child2.disabled ? ' text-body-tertiary' : '')
                                }
                                variant="light"
                                key={child2.key}
                                onClick={() => setSelectedSubTabkey(child2.key)}
                                onContextMenu={(e) =>
                                    handleToggleFileDisabled(e, child2.key)
                                }
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
                        genkey === TabKey.EV3BDECOMPILED) &&
                        code !== undefined && (
                            <SyntaxHighlighter
                                style={vs}
                                language={genkey === TabKey.PYCODE ? 'python' : 'less'}
                            >
                                {code}
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

    if (elem) return createTabElemContent(elem);
};

export default TabContents;
