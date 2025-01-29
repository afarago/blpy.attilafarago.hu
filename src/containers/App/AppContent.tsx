import { IFileContent, MyContext } from '../../contexts/MyContext';
import {
    IPyConverterFile,
    IPyConverterOptions,
    convertProjectToPython,
} from 'blocklypy';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import FileSelector from '../../components/FileSelector/FileSelector';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import MainTab from '../../components/TabMain/TabMain';
import ReactGA from 'react-ga4';
import { Toast } from 'react-bootstrap';
import WelcomeTab from '../../components/TabWelcome/TabWelcome';

const useDragAndDrop = (
    setSelectedFileContent: (content: IFileContent | undefined) => void,
) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(true);
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.stopPropagation();
            event.preventDefault();
            setIsDragging(false);
            const files = [...event.dataTransfer?.files];
            setSelectedFileContent({ files, builtin: false });
        },
        [setSelectedFileContent],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

const AppContent: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        isAdditionalCommentsChecked,
        setConversionResult,
        toastMessage,
        setToastMessage,
        selectedFileContent: selectedFile,
        setSelectedFileContent: setSelectedFileContent,
        fullScreen,
    } = context;

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragAndDrop(setSelectedFileContent);

    const handleFileUpload = useCallback(
        async (filecontent: IFileContent) => {
            const files = [...filecontent.files];
            try {
                const inputs: IPyConverterFile[] = [];
                for (const file of files) {
                    const buffer = await file.arrayBuffer();
                    const date = filecontent.builtin
                        ? undefined
                        : new Date(file.lastModified);
                    // directory picker adds webkitRelativePath, better visibility for dependency graph
                    const name = (file as any).webkitRelativePath || file.name;
                    
                    inputs.push({
                        name,
                        buffer,
                        size: file.size,
                        date,
                    });
                }
                const options: IPyConverterOptions = {
                    debug: {
                        ...(isAdditionalCommentsChecked
                            ? { showExplainingComments: true, showBlockIds: true }
                            : {}),
                    },
                    output: {
                        'ev3b.decompiled': true,
                    },
                };
                const retval = await convertProjectToPython(inputs, options);

                ReactGA.send({
                    hitType: 'event',
                    eventCategory: 'file_conversion',
                    eventAction: 'finished_conversion',
                    eventLabel: `file_name: ${[...files]
                        .map((f) => (filecontent?.builtin ? '#sample#' : '' + f.name))
                        .join(', ')}`,
                });

                setToastMessage(undefined);
                setConversionResult(retval);

                //TODO: handle multiple files
            } catch (error) {
                ReactGA.send({
                    hitType: 'event',
                    eventCategory: 'file_conversion',
                    eventAction: 'failed_conversion',
                    eventLabel: `file_name: ${[...files]
                        .map((f) => (filecontent?.builtin ? '#sample#' : '' + f.name))
                        .join(', ')}`,
                    eventValue: error,
                });

                console.error('Error converting project to Python:', error);
                setToastMessage(
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred.',
                );
                setConversionResult(undefined);
            }
        },
        [isAdditionalCommentsChecked],
    );

    useEffect(() => {
        if (selectedFile) {
            handleFileUpload(selectedFile);
        }
    }, [selectedFile, handleFileUpload]);

    return (
        <div className={fullScreen ? 'fullscreen' : ''}>
            <Header />
            <Toast
                onClose={() => setToastMessage(undefined)}
                show={toastMessage !== undefined}
                delay={5000}
                autohide
                className="top-0 end-0"
            >
                <Toast.Header>
                    <span className="me-auto">Conversion Error</span>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>

            <div className="appcontent container-lg">
                <h3 className="pt-3">
                    {' '}
                    SPIKE and EV3 to Pybricks Wizard{' '}
                    <small className="text-muted d-sm-block d-none d-lg-inline">
                        block-code converter to Pybricks python code
                    </small>
                </h3>

                <form method="post" encType="multipart/form-data">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={
                            'main-content dropzone pb-3' +
                            (isDragging ? ' drop-active' : '')
                        }
                        aria-dropeffect="move"
                        role="presentation"
                    >
                        <FileSelector
                            selectedFileContent={selectedFile}
                            setSelectedFileContent={setSelectedFileContent}
                        ></FileSelector>
                        <WelcomeTab></WelcomeTab>
                        <MainTab></MainTab>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default AppContent;
