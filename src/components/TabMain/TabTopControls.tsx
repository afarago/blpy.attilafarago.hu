import {
    CheckLg,
    Copy,
    Download,
    Fullscreen,
    FullscreenExit,
} from 'react-bootstrap-icons';
import { ITabElem, TabKey } from './TabMain';
import React, { useCallback, useContext, useMemo } from 'react';

import { Form } from 'react-bootstrap';
import { MyContext } from '../../contexts/MyContext';
import domtoimage from 'dom-to-image';
import { useHotkeys } from 'react-hotkeys-hook';

interface TabTopControlsProps {
    selectedTabkey: string;
    setSelectedTabkey: (key: string) => void;
    selectedSubTabkey: string;
    setSelectedSubTabkey: (key: string) => void;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
    tabElems: ITabElem[];
}

const TabTopControls: React.FC<TabTopControlsProps> = ({
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
    const {
        selectedFileContent,
        conversionResult,
        isAdditionalCommentsChecked,
        setIsAdditionalCommentsChecked,
        fullScreen,
        toggleFullScreen,
        svgContentData,
        rbfDecompileData,
        isCopying,
        setIsCopying,
    } = context;

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
                if (!conversionResult || !selectedFileContent) return;

                setIsCopying(true);
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
                            if (selectedTabkey === TabKey.PREVIEW) ref = svgRef;
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
                                        selectedFileContent.files[0].name,
                                    );
                                    if (selectedFileContent.files.length > 1) {
                                        filebase = `${filebase}_plus_${selectedFileContent.files.length}_files`;
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
                            selectedTabkey === TabKey.PLAINCODE
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
                setTimeout(() => setIsCopying(false), 1000);
            }

            return false;
        },
        [
            conversionResult,
            selectedTabkey,
            selectedSubTabkey,
            svgRef,
            graphRef,
            selectedFileContent,
            tabElems,
        ],
    );

    const getBaseName = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return baseName;
    };

    const getCopyIcon = useMemo(() => {
        if (isCopying) return <CheckLg />;
        if ([TabKey.PREVIEW, TabKey.CALLGRAPH].includes(selectedTabkey as TabKey))
            return <Download />;
        return <Copy />;
    }, [isCopying, selectedTabkey]);

    useHotkeys(
        'control+e',
        () => toggleIsAdditionalCommentsChecked(),
        { preventDefault: true },
        [setIsAdditionalCommentsChecked, isAdditionalCommentsChecked],
    );
    useHotkeys('control+f', () => toggleFullScreen(), { preventDefault: true }, [
        fullScreen,
    ]);
    useHotkeys('esc', () => toggleFullScreen(false), { preventDefault: true }, []);
    useHotkeys('control+c', () => handleCopyButtonClick(), { preventDefault: true }, [
        conversionResult,
        selectedTabkey,
    ]);

    return (
        <>
            <div className="code-top-container">
                {[TabKey.PYCODE, TabKey.PLAINCODE].includes(selectedTabkey as TabKey) &&
                    conversionResult?.filetype !== 'python' && (
                        <Form.Check
                            type="switch"
                            id="additionalCommentsCheck"
                            label="Explanatory&nbsp;Comments"
                            checked={isAdditionalCommentsChecked}
                            title="Add explanatory comments to the source code (ctrl+e)"
                            onChange={handleSetIsAdditionalCommentsChecked}
                        />
                    )}
                <button
                    className={`mini-button bg-white copy-button-${selectedTabkey} ${
                        isCopying ? 'success' : ''
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
                        toggleFullScreen();
                    }}
                    title="Full screen (ctrl+f)"
                >
                    {fullScreen ? <FullscreenExit /> : <Fullscreen />}
                </button>
            </div>
            {svgContentData &&
                (selectedTabkey === TabKey.PYCODE ||
                    selectedTabkey === TabKey.PLAINCODE) && (
                    <div
                        className="svg-minimap mt-5 px-3 float-right"
                        dangerouslySetInnerHTML={{
                            __html: svgContentData || '',
                        }}
                        onClick={() => setSelectedTabkey(TabKey.PREVIEW)}
                        role="presentation"
                    ></div>
                )}
        </>
    );
};

export default TabTopControls;
