import {
    CheckLg,
    Copy,
    Download,
    Fullscreen,
    FullscreenExit,
} from 'react-bootstrap-icons';
import React, { useCallback, useContext, useState } from 'react';

import { Form } from 'react-bootstrap';
import { MyContext } from '../../contexts/MyContext';
import { TabKey } from './TabMain';
import domtoimage from 'dom-to-image';
import { useHotkeys } from 'react-hotkeys-hook';

interface TabTopControlsProps {
    tabkey: TabKey;
    setTabkey: (key: TabKey) => void;
    svgRef: React.RefObject<HTMLDivElement | null>;
    graphRef: React.RefObject<HTMLDivElement | null>;
}

const TabTopControls: React.FC<TabTopControlsProps> = ({
    tabkey,
    setTabkey,
    svgRef,
    graphRef,
}) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        selectedFile,
        conversionResult,
        isAdditionalCommentsChecked,
        setIsAdditionalCommentsChecked,
        fullScreen,
        toggleFullScreen,
        svgContentData,
        rbfDecompileData,
    } = context;

    const [isCopying, setIsCopying] = useState(false);

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
                if (!conversionResult || !selectedFile) return;

                setIsCopying(true);
                let textcontent: string | undefined;
                switch (tabkey) {
                    case TabKey.PYCODE:
                    case TabKey.PLAINCODE:
                        textcontent = conversionResult[tabkey];
                        navigator.clipboard.writeText(textcontent ?? '');
                        break;

                    case TabKey.EV3BDECOMPILED:
                        textcontent = rbfDecompileData;
                        navigator.clipboard.writeText(textcontent ?? '');
                        break;

                    case TabKey.PREVIEW:
                    case TabKey.CALLGRAPH:
                        {
                            let ref:
                                | React.RefObject<HTMLDivElement | null>
                                | undefined = undefined;
                            if (tabkey === TabKey.PREVIEW) ref = svgRef;
                            else if (tabkey === TabKey.CALLGRAPH) ref = graphRef;
                            if (!ref?.current) return;
                            let ext = tabkey === TabKey.PREVIEW ? 'preview' : 'graph';

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
                                    link.download = `${getBaseName(
                                        selectedFile.file.name,
                                    )}_${ext}.png`;
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
                        }
                        break;
                }
            } catch (e) {
                console.error('::ERROR::', e);
            } finally {
                setTimeout(() => setIsCopying(false), 1000);
            }

            return false;
        },
        [conversionResult, tabkey, svgRef, selectedFile, rbfDecompileData],
    );

    const getBaseName = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        const baseName = filename.substring(0, lastDotIndex);
        return baseName;
    };

    const getCopyIcon = () => {
        if (isCopying) return <CheckLg />;
        if ([TabKey.PREVIEW, TabKey.CALLGRAPH].includes(tabkey)) return <Download />;
        return <Copy />;
    };

    useHotkeys(
        'mod+e',
        () => toggleIsAdditionalCommentsChecked(),
        { preventDefault: true },
        [setIsAdditionalCommentsChecked, isAdditionalCommentsChecked],
    );
    useHotkeys('mod+f', () => toggleFullScreen(), { preventDefault: true }, [
        fullScreen,
    ]);
    useHotkeys('esc', () => toggleFullScreen(false), { preventDefault: true }, []);
    useHotkeys('mod+c', () => handleCopyButtonClick(), { preventDefault: true }, [
        conversionResult,
        tabkey,
    ]);

    return (
        <>
            <div className="code-top-container">
                {tabkey === TabKey.PYCODE &&
                    conversionResult?.devicetype !== 'python' && (
                        <Form.Check
                            type="switch"
                            id="additionalCommentsCheck"
                            label="Explanatory&nbsp;Comments"
                            checked={isAdditionalCommentsChecked}
                            title="Add explanatory comments to the source code (ctrl/cmd+e)"
                            onChange={handleSetIsAdditionalCommentsChecked}
                        />
                    )}
                <button
                    className={`mini-button copy-button-${tabkey} ${
                        isCopying ? 'success' : ''
                    }`}
                    onClick={handleCopyButtonClick}
                    title="Copy code (ctrl/cmd+c)"
                >
                    {getCopyIcon()}
                </button>
                <button
                    className="mini-button"
                    onClick={(evt) => {
                        evt.preventDefault();
                        toggleFullScreen();
                    }}
                    title="Full screen (ctrl/cmd+f)"
                >
                    {fullScreen ? <FullscreenExit /> : <Fullscreen />}
                </button>
            </div>
            {svgContentData && [TabKey.PYCODE, TabKey.PLAINCODE].includes(tabkey) && (
                <div
                    className="svg-minimap mt-5 px-3 float-right"
                    dangerouslySetInnerHTML={{
                        __html: svgContentData || '',
                    }}
                    onClick={() => setTabkey(TabKey.PREVIEW)}
                    role="presentation"
                ></div>
            )}
        </>
    );
};

export default TabTopControls;
