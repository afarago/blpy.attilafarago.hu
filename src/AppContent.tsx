import './AppContent.scss';

import React, { Suspense, lazy, useRef } from 'react';
import {
    fileContentSet,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import { selectTabs, toastContentSet } from '@/features/tabs/tabsSlice';

import FileSelector from '@/features/fileContent/FileSelector';
import Footer from '@/features/footer/Footer';
import Header from '@/features/header/Header';
import TabLoading from '@/features/tabs/TabLoading';
import Toast from 'react-bootstrap/Toast';
import WelcomeTab from '@/features/welcome/TabWelcome';
import { selectConversion } from '@/features/conversion/conversionSlice';
import { useAppDispatch } from '@/app/hooks';
import { useDragAndDrop } from '@/utils/dragndrop-hook';
import { useSelector } from 'react-redux';

const MainTab = lazy(() => import('@/features/tabs/TabMain'));

const AppContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { additionalCommentsChecked, toastContent, fullScreen } =
        useSelector(selectTabs);
    const fileContent = useSelector(selectFileContent);
    const { conversionResult } = useSelector(selectConversion);

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop(
        (files: File[]) => {
            // NOTE: directories are also added, need to filter them out later
            const payload = {
                files: files,
                builtin: false,
                additionalCommentsChecked,
            };
            dispatch(fileContentSet(payload));
        },
    );

    return (
        <div className={'AppContent' + (fullScreen ? ' fullscreen' : '')}>
            <Header />
            <Toast
                onClose={() => dispatch(toastContentSet(undefined))}
                show={toastContent !== undefined}
                delay={10000}
                autohide
                className="position-fixed top-0 end-0 mt-2 me-2"
            >
                <Toast.Header>
                    <img
                        src="/favicon/favicon-48x48.png"
                        className="rounded me-2"
                        aria-hidden
                    />
                    <span className="me-auto">
                        {toastContent?.header ?? 'Conversion Error'}
                    </span>
                </Toast.Header>
                <Toast.Body>
                    <>
                        {toastContent?.body.map((line) => (
                            <div>{line}</div>
                        ))}
                    </>
                </Toast.Body>
            </Toast>

            <div className="container-lg mycontent">
                <h3 className="pt-3 hide-on-short">
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

                        {conversionResult ? (
                            <Suspense fallback={<TabLoading />}>
                                <MainTab />
                            </Suspense>
                        ) : (
                            <WelcomeTab fileInputRef={fileInputRef} />
                        )}
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default AppContent;
