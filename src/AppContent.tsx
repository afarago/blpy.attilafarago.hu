import './scss/App.scss';

import { PyConverterOptions, convertProjectToPython } from 'blocklypy';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import FileSelector from './FileSelector';
import MainTab from './TabMain';
import { MyContext } from './contexts/MyContext';
import WelcomeTab from './TabWelcome';

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

const AppContent: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const {
        isAdditionalCommentsChecked,
        setConversionResult,
        setToastMessage,
        setFilename,
    } = context;

    const [selectedFile, setSelectedFile] = useState<File>();

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragAndDrop(setSelectedFile);

    const handleFileUpload = useCallback(
        async (file: File) => {
            try {
                const input = await file.arrayBuffer();
                const options: PyConverterOptions = {
                    filename: file.name,
                    debug: {
                        'ev3b.decompiled': true,
                        ...(isAdditionalCommentsChecked
                            ? { showExplainingComments: true, showBlockIds: true }
                            : {}),
                    },
                };

                const retval = await convertProjectToPython(input, options);

                setFilename(file.name);
                setToastMessage(undefined);
                setConversionResult(retval);
            } catch (error) {
                console.error('Error converting project to Python:', error);
                setToastMessage(
                    error instanceof Error
                        ? `${error.message} - ${file.name}`
                        : 'An unknown error occurred.',
                );
                setConversionResult(undefined);
                setFilename(undefined);
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
        <div className="appcontent container-md d-flex flex-column flex-fill">
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
                    className={
                        'main-content dropzone container-md pt-3 d-flex flex-column flex-fill' +
                        isDragging
                            ? 'drop-active'
                            : ''
                    }
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
    );
};

export default AppContent;
