import { IFileContent, MyContext } from '../../contexts/MyContext';
import { PyConverterOptions, convertProjectToPython } from 'blocklypy';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import FileSelector from '../../components/FileSelector/FileSelector';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import MainTab from '../../components/TabMain/TabMain';
import ReactGA from 'react-ga4';
import { Toast } from 'react-bootstrap';
import WelcomeTab from '../../components/TabWelcome/TabWelcome';

const useDragAndDrop = (setSelectedFile: (file: IFileContent | undefined) => void) => {
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
            const file: File = event.dataTransfer?.files[0];
            setSelectedFile({ file, builtin: false });
        },
        [setSelectedFile],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

const AppContent: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        isAdditionalCommentsChecked,
        conversionResult,
        setConversionResult,
        toastMessage,
        setToastMessage,
        selectedFile,
        setSelectedFile,
        fullScreen,
    } = context;

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragAndDrop(setSelectedFile);

    const handleFileUpload = useCallback(
        async (filecontent: IFileContent) => {
            const file = filecontent.file;
            try {
                const input = await file.arrayBuffer();
                const options: PyConverterOptions = {
                    filename: file.name,
                    filelastmodified: filecontent.builtin
                        ? undefined
                        : new Date(file.lastModified),
                    filesize: file.size,
                    debug: {
                        'ev3b.decompiled': true,
                        ...(isAdditionalCommentsChecked
                            ? { showExplainingComments: true, showBlockIds: true }
                            : {}),
                    },
                };

                const retval = await convertProjectToPython(input, options);

                ReactGA.send({
                    hitType: 'event',
                    eventCategory: 'file_conversion',
                    eventAction: 'finished_conversion',
                    eventLabel: `file_name: ${selectedFile?.builtin ? '#sample#' : ''}${
                        selectedFile?.file.name
                    }`,
                });

                setToastMessage(undefined);
                setConversionResult(retval);
            } catch (error) {
                ReactGA.send({
                    hitType: 'event',
                    eventCategory: 'file_conversion',
                    eventAction: 'failed_conversion',
                    eventLabel: `file_name: ${selectedFile?.builtin ? '#sample#' : ''}${
                        selectedFile?.file.name
                    }`,
                    eventValue: error,
                });

                console.error('Error converting project to Python:', error);
                setToastMessage(
                    error instanceof Error
                        ? `${error.message} - ${file?.name}`
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
                className="position-fixed top-0 end-0"
            >
                <Toast.Header>
                    <span className="me-auto">Conversion Error</span>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>

            <div className="appcontent container-md">
                <h3>
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
                            'main-content dropzone container-md py-3' +
                            (isDragging ? ' drop-active' : '')
                        }
                        aria-dropeffect="move"
                        role="presentation"
                    >
                        <FileSelector
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
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
