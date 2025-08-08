import type { ITabElem } from './TabMain';
import { TabKey } from './TabMainTabKeys';

import React, { Ref, Suspense, useEffect } from 'react';
import Markdown from 'react-markdown';

import {
    selectSvgContentData,
    selectWeDo2PreviewData,
} from '@/features/conversion/conversionSlice';
import { fileSetEnabled } from '@/features/fileContent/fileContentSlice';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import svgPanZoom from 'svg-pan-zoom';
import TabLoading from './TabLoading';
import { selectTabs } from './tabsSlice';
// import SyntaxHighlighter from 'react-syntax-highlighter';
import { useAppDispatch } from '@/app/hooks';
import { useSelector } from 'react-redux';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { selectAiSummary } from '../aiSummary/aiSummarySlice';

const CallGraph = React.lazy(() => import('@/features/graph/CallGraph'));
const GroqSVG = React.lazy(() => import('@/assets/img/groq.svg?react'));

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('less', less);

interface TabContentsProps {
    genkey: string;
    gensubkey?: string;
    selectedTabkey: string;
    setSelectedTabkey: (key: string) => void;
    selectedSubTabkey: string;
    setSelectedSubTabkey: (key: string) => void;
    previewRef: React.RefObject<HTMLDivElement | HTMLImageElement | null>;
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
    previewRef,
    graphRef,
    tabElems,
}) => {
    const { copying } = useSelector(selectTabs);
    const svgContentData = useSelector(selectSvgContentData);
    const wedo2PreviewData = useSelector(selectWeDo2PreviewData);
    const aiSummary = useSelector(selectAiSummary);
    const dispatch = useAppDispatch();

    const REFMAP = {
        [TabKey.PREVIEW]: { ref: previewRef, ext: 'preview' },
        [TabKey.CALLGRAPH]: { ref: graphRef, ext: 'graph' },
    } as {
        [key: string]: { ref: React.RefObject<HTMLElement>; ext: string };
    };

    let panzoom: SvgPanZoom.Instance | undefined;
    useEffect(() => {
        const element = REFMAP[genkey]?.ref.current;

        // let observer: MutationObserver | undefined;);
        const svgelement = element?.querySelector<HTMLElement>('svg, div>svg'); //!! svg
        if (svgelement) {
            panzoom = svgPanZoom(svgelement, {
                zoomScaleSensitivity: 0.3,
                controlIconsEnabled: !copying,
                // mouseWheelZoomEnabled: true,
                // panEnabled: true,
                // zoomEnabled: true,
                // contain: true,
                // fit: true,
                minZoom: 0.1,
                // maxZoom: 10,
            });
        }

        return () => {
            try {
                panzoom?.destroy();
            } catch {}
        };
    }, [
        previewRef,
        graphRef,
        svgContentData,
        wedo2PreviewData,
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
                        `content-${genkey}` +
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
                    {genkey === TabKey.CALLGRAPH && (
                        <Suspense fallback={<TabLoading />}>
                            <CallGraph ref={graphRef} />
                        </Suspense>
                    )}
                    {genkey === TabKey.PREVIEW &&
                        (svgContentData ? (
                            <div
                                ref={previewRef as Ref<HTMLDivElement>}
                                dangerouslySetInnerHTML={{
                                    __html: svgContentData ?? '',
                                }}
                            />
                        ) : wedo2PreviewData ? (
                            <img
                                ref={previewRef as Ref<HTMLImageElement>}
                                src={wedo2PreviewData}
                                alt="WeDo 2.0 preview"
                            />
                        ) : (
                            <></>
                        ))}
                    {genkey === TabKey.AISUMMARY &&
                        (aiSummary.loading ? (
                            <TabLoading />
                        ) : (
                            <div className="ai-summary">
                                <Markdown>{aiSummary.code ?? aiSummary.error}</Markdown>
                                <div className="smaller opacity-50 m-2 position-absolute bottom-0 end-0 text-secondary">
                                    powered by{' '}
                                    <a
                                        href="https://groq.com"
                                        target="_blank"
                                        className="text-secondary"
                                    >
                                        <GroqSVG />
                                    </a>
                                </div>
                            </div>
                        ))}
                </Tab.Pane>
            </>
        );
    }

    if (elem) return createTabElemContent(elem);
};

export default TabContents;
