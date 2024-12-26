import './scss/App.scss';

import { PyConverterOptions, PyProjectResult, convertProjectToPython } from 'blocklypy';
import React, { useCallback, useEffect, useState } from 'react';

import FileSelector from './FileSelector';
import Footer from './Footer';
import Header from './Header';
import MainTab from './TabMain';
import Toast from 'react-bootstrap/Toast';
import WelcomeTab from './TabWelcome';
import classNames from 'classnames';

const useDragAndDrop = (
    setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>,
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
            setSelectedFile(event.dataTransfer?.files[0]);
        },
        [setSelectedFile],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

const App: React.FC = () => {
    const [isInitial, setIsInitial] = useState(true);
    const [conversionResult, setConversionResult] = useState<PyProjectResult>();
    const [svgContent, setSvgContent] = useState<string>();
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        useState(false);
    const [toastMessage, setToastMessage] = useState<string>();

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragAndDrop(setSelectedFile);

    const handleFileUpload = useCallback(
        async (file: File) => {
            try {
                const input = await file.arrayBuffer();
                const options: PyConverterOptions = {
                    filename: file.name,
                    debug: isAdditionalCommentsChecked
                        ? { showExplainingComments: true }
                        : {},
                };

                const retval = await convertProjectToPython(input, options);

                setIsInitial(false);
                setToastMessage(undefined);
                setConversionResult(retval);
                setSvgContent(retval?.additionalFields?.blockly?.svg);
            } catch (error) {
                console.error('Error converting project to Python:', error);
                setToastMessage(
                    error instanceof Error
                        ? `${error.message} - ${file.name}`
                        : 'An unknown error occurred.',
                );
                setIsInitial(true);
                setConversionResult(undefined);
                setSvgContent(undefined);
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
        <div className="App d-flex flex-column flex-fill">
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

            <div className="container d-flex flex-column flex-fill">
                <h3>
                    SPIKE and EV3 to Pybricks Wizard{' '}
                    <small className="text-muted d-block d-lg-inline">
                        block-code converter to Pybricks python code
                    </small>
                </h3>

                <form
                    method="post"
                    encType="multipart/form-data"
                    className="d-flex flex-column flex-fill"
                >
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={classNames(
                            'main-content',
                            'dropzone',
                            'container',
                            'pt-3',
                            'd-flex',
                            'flex-column',
                            'flex-fill',
                            {
                                'drop-active': isDragging,
                            },
                        )}
                        role="presentation"
                    >
                        <FileSelector
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                        ></FileSelector>
                        <WelcomeTab isInitial={isInitial}></WelcomeTab>
                        <MainTab
                            isInitial={isInitial}
                            svgContent={svgContent}
                            conversionResult={conversionResult}
                            isAdditionalCommentsChecked={isAdditionalCommentsChecked}
                            setIsAdditionalCommentsChecked={
                                setIsAdditionalCommentsChecked
                            }
                            selectedFile={selectedFile}
                        ></MainTab>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default App;
