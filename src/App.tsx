import React, { useEffect, useState } from 'react';
import { convertProjectToPython, PyConverterOptions, PyProjectResult } from 'blocklypy';
import './App.scss';
import Header from './Header';
import Footer from './Footer';
import FileSelector from './FileSelector';
import DummyTab from './TabWelcome';
import MainTab from './TabMain';
import classNames from 'classnames';
import Toast from 'react-bootstrap/Toast';
// import { GITHUB_VERSION } from './github_version.ts.old';

const App: React.FC = () => {
    const [isInitial, setIsInitial] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [conversionResult, setConversionResult] = useState<
        PyProjectResult | undefined
    >(undefined);
    const [svgContent, setSvgContent] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        React.useState(false);
    const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);

    const handleFileUpload = (file: File) => {
        file.arrayBuffer().then(async (input) => {
            const options = {
                filename: file.name,
                debug: {},
            } as PyConverterOptions;

            if (options.debug && isAdditionalCommentsChecked) {
                options.debug.showExplainingComments = true;
            }

            try {
                const retval = await convertProjectToPython(input, options);

                setIsInitial(false);
                setToastMessage(undefined);
                setConversionResult(retval);
                setSvgContent(retval?.additionalFields?.blockly?.svg);
            } catch (error) {
                console.error('Error converting project to Python:', error);
                if (error instanceof Error) {
                    setToastMessage(error.message + ' - ' + options.filename);
                } else {
                    setToastMessage('An unknown error occurred.');
                }
                console.log('toastMessage:', error);

                setIsInitial(true);
                setConversionResult(undefined);
                setSvgContent(undefined);
            }
        });
    };

    function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(true);
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    }
    function handleDragLeave(event: React.DragEvent<HTMLDivElement>): void {
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    }
    function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(false);
        setSelectedFile(event?.dataTransfer?.files[0]);
    }

    useEffect(() => {
        if (selectedFile) {
            handleFileUpload(selectedFile);
        }
    }, [selectedFile, handleFileUpload, isAdditionalCommentsChecked]);

    return (
        <div className="App d-flex flex-column flex-fill">
            <Header />
            <Toast
                onClose={() => setToastMessage(undefined)}
                show={toastMessage !== undefined}
                delay={50000}
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
                    SPIKE to Pybricks Wizard{' '}
                    <small className="text-muted">
                        word-block converter to Pybricks python code (beta)
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
                    >
                        <FileSelector
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                        ></FileSelector>
                        <DummyTab isInitial={isInitial}></DummyTab>
                        <MainTab
                            isInitial={isInitial}
                            svgContent={svgContent}
                            conversionResult={conversionResult}
                            isAdditionalCommentsChecked={isAdditionalCommentsChecked}
                            setIsAdditionalCommentsChecked={
                                setIsAdditionalCommentsChecked
                            }
                        ></MainTab>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default App;
