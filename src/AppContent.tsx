import React, { useCallback, useRef, useState } from 'react';
import {
    fileContentSet,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import { selectTabs, toastContentSet } from '@/features/tabs/tabsSlice';

import FileSelector from '@/features/fileContent/FileSelector';
import Footer from '@/features/footer/Footer';
import Header from '@/features/header/Header';
import MainTab from '@/features/tabs/TabMain';
import TabLoading from './features/tabs/TabLoading';
import Toast from 'react-bootstrap/Toast';
import WelcomeTab from '@/features/welcome/TabWelcome';
import { useAppDispatch } from '@/app/hooks';
import { useSelector } from 'react-redux';

const useDragAndDrop = (setFilesFn: (files: File[]) => void) => {
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
            setFilesFn(files);
        },
        [setFilesFn],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

const AppContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { additionalCommentsChecked, toastContent, fullScreen } =
        useSelector(selectTabs);
    const fileContent = useSelector(selectFileContent);

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop(
        (files: File[]) => {
            const payload = {
                files: files,
                builtin: false,
                additionalCommentsChecked,
            };
            dispatch(fileContentSet(payload));
        },
    );

    return (
        <div className={fullScreen ? 'fullscreen' : ''}>
            <Header />
            <Toast
                onClose={() => dispatch(toastContentSet(undefined))}
                show={toastContent !== undefined}
                delay={5000}
                autohide
                className="top-0 end-0"
            >
                <Toast.Header>
                    <span className="me-auto">Conversion Error</span>
                </Toast.Header>
                <Toast.Body>{toastContent}</Toast.Body>
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
                            'main-content dropzone pb-3 position-relative' +
                            (isDragging ? ' drop-active' : '')
                        }
                        aria-dropeffect="move"
                        role="presentation"
                    >
                        <FileSelector fileInputRef={fileInputRef}></FileSelector>

                        {fileContent.showSpinner && <TabLoading />}
                        <WelcomeTab fileInputRef={fileInputRef} />
                        <MainTab />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default AppContent;
