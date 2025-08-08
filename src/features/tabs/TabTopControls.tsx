import {
    CheckLg,
    Copy,
    Download,
    Fullscreen,
    FullscreenExit,
} from 'react-bootstrap-icons';
import type { ITabElem } from './TabMain';
import { TabKey } from './TabMainTabKeys';
import React, { useCallback, useMemo } from 'react';
import {
    additionalCommentsCheckedSet,
    copyingSet,
    fullScreenSet,
    fullScreenToggle,
    selectTabs,
} from '@/features/tabs/tabsSlice';
import {
    selectConversion,
    selectSvgContentData,
    selectWeDo2PreviewData,
} from '@/features/conversion/conversionSlice';

import Form from 'react-bootstrap/Form';
import domtoimage from 'dom-to-image';
import { selectFileContent } from '@/features/fileContent/fileContentSlice';
import { useAppDispatch } from '@/app/hooks';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector } from 'react-redux';

interface TabTopControlsProps {
    selectedTabkey: string;
    setSelectedTabkey: (key: string) => void;
    selectedSubTabkey: string;
    setSelectedSubTabkey: (key: string) => void;
    previewRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
    tabElems: ITabElem[];
}

const TabTopControls: React.FC<TabTopControlsProps> = ({
    selectedTabkey,
    setSelectedTabkey,
    selectedSubTabkey,
    setSelectedSubTabkey,
    previewRef,
    graphRef,
    tabElems,
}) => {
    const dispatch = useAppDispatch();
    const { fullScreen, copying, additionalCommentsChecked } = useSelector(selectTabs);
    const { conversionResult } = useSelector(selectConversion);
    const svgContentData = useSelector(selectSvgContentData);
    const fileContent = useSelector(selectFileContent);
    const wedo2PreviewData = useSelector(selectWeDo2PreviewData);

    const handleSetIsAdditionalCommentsChecked = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(additionalCommentsCheckedSet(event.target.checked));
        },
        [],
    );

    const toggleIsAdditionalCommentsChecked = useCallback(() => {
        dispatch(additionalCommentsCheckedSet(!additionalCommentsChecked));
    }, [additionalCommentsChecked]);

    const handleCopyButtonClick = useCallback(
        (event?: React.MouseEvent<HTMLButtonElement>) => {
            event?.stopPropagation();
            event?.preventDefault();

            try {
                if (!conversionResult || !fileContent) return;

                dispatch(copyingSet(true));
                let textcontent: string | undefined;
                let tabelem = tabElems.find((elem) => elem.key === selectedTabkey);
                if (tabelem?.children) {
                    tabelem = tabelem.children.find(
                        (elem) => elem.key === selectedSubTabkey,
                    );
                }
                if (!tabelem) return;

                switch (selectedTabkey) {
                    case TabKey.EV3BDECOMPILED:
                        textcontent = tabelem.code;
                        navigator.clipboard.writeText(textcontent ?? '');
                        break;

                    case TabKey.PREVIEW:
                    case TabKey.CALLGRAPH:
                        {
                            let ref:
                                | React.RefObject<HTMLDivElement | null>
                                | undefined = undefined;
                            if (selectedTabkey === TabKey.PREVIEW) ref = previewRef;
                            else if (selectedTabkey === TabKey.CALLGRAPH)
                                ref = graphRef;
                            if (!ref?.current) return;
                            let ext =
                                selectedTabkey === TabKey.PREVIEW ? 'preview' : 'graph';

                            domtoimage
                                .toBlob(ref.current, {})
                                .then((blob: Blob) => {
                                    const dataUrl = URL.createObjectURL(blob); // Create a temporary URL for the image data

                                    // Proceed with download using the temporary URL
                                    let filebase = getBaseName(
                                        fileContent.files[0].name,
                                    );
                                    if (fileContent.files.length > 1) {
                                        filebase = `${filebase}_plus_${fileContent.files.length}_files`;
                                    }
                                    const link = document.createElement('a');
                                    link.href = dataUrl;
                                    link.download = `${filebase}_${ext}.png`;
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

                            // // also put it to the clipboard
                            // // this would be subject to animations and might not work
                            // domtoimage.toBlob(ref.current, {}).then((data: Blob) => {
                            //     // copy image to clipboard
                            //     const data2: any = [
                            //         new ClipboardItem({
                            //             'image/png': data,
                            //         }),
                            //     ];
                            //     navigator.clipboard.write(data2);
                            // });
                        }
                        break;

                    default: {
                        if (
                            selectedTabkey === TabKey.PYCODE ||
                            selectedTabkey === TabKey.PLAINCODE ||
                            selectedTabkey === TabKey.AISUMMARY
                        ) {
                            if (tabelem) {
                                textcontent = tabelem.code;
                                navigator.clipboard.writeText(textcontent ?? '');
                            }
                        }
                        break;
                    }
                }
            } catch (e) {
                console.error('::ERROR::', e);
            } finally {
                setTimeout(() => dispatch(copyingSet(false)), 1000);
            }

            return false;
        },
        [
            conversionResult,
            selectedTabkey,
            selectedSubTabkey,
            previewRef,
            graphRef,
            fileContent,
            tabElems,
        ],
    );

    const getBaseName = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return baseName;
    };

    const getCopyIcon = useMemo(() => {
        if (copying) return <CheckLg />;
        if ([TabKey.PREVIEW, TabKey.CALLGRAPH].includes(selectedTabkey as TabKey))
            return <Download />;
        return <Copy />;
    }, [copying, selectedTabkey]);

    useHotkeys(
        'control+e',
        () => toggleIsAdditionalCommentsChecked(),
        { preventDefault: true },
        [additionalCommentsChecked],
    );
    useHotkeys(
        'control+f',
        () => dispatch(fullScreenToggle()),
        { preventDefault: true },
        [fullScreen],
    );
    useHotkeys(
        'esc',
        () => dispatch(fullScreenSet(false)),
        { preventDefault: true },
        [],
    );
    useHotkeys('control+c', () => handleCopyButtonClick(), { preventDefault: true }, [
        conversionResult,
        selectedTabkey,
    ]);

    const renderTopContainer = () => (
        <div className="code-top-container">
            {[TabKey.PYCODE, TabKey.PLAINCODE].includes(selectedTabkey as TabKey) &&
                conversionResult?.filetype !== 'python' && (
                    <Form.Check
                        type="switch"
                        id="additionalCommentsCheck"
                        label={
                            <>
                                <span className="d-none d-lg-inline">
                                    Explanatory&nbsp;
                                </span>
                                Comments
                            </>
                        }
                        checked={additionalCommentsChecked}
                        title="Add explanatory comments to the source code (ctrl+e)"
                        onChange={handleSetIsAdditionalCommentsChecked}
                    />
                )}
            <button
                className={`mini-button bg-white copy-button-${selectedTabkey} ${
                    copying ? 'success' : ''
                }`}
                onClick={handleCopyButtonClick}
                title="Copy code (ctrl+c)"
            >
                {getCopyIcon}
            </button>
            <button
                className="mini-button bg-white"
                onClick={(evt) => {
                    evt.preventDefault();
                    dispatch(fullScreenToggle());
                }}
                title="Full screen (ctrl+f)"
            >
                {fullScreen ? <FullscreenExit /> : <Fullscreen />}
            </button>
        </div>
    );

    const renderSVGMinimap = () =>
        (svgContentData || wedo2PreviewData) &&
        (selectedTabkey === TabKey.PYCODE || selectedTabkey === TabKey.PLAINCODE) && (
            <div
                className="svg-minimap mt-5 px-3 float-right d-none d-lg-block"
                onClick={() => setSelectedTabkey(TabKey.PREVIEW)}
                role="presentation"
            >
                <>
                    {svgContentData !== undefined ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: svgContentData ?? '' }}
                        />
                    ) : (
                        wedo2PreviewData !== undefined && (
                            <img src={wedo2PreviewData} alt="WeDo 2.0 preview" />
                        )
                    )}
                </>
            </div>
        );
    return (
        <>
            {renderTopContainer()}
            {renderSVGMinimap()}
        </>
    );
};

export default TabTopControls;
