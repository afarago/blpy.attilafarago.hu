import React, { useEffect, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import Github from '@/assets/img/github.png';
import { ACCEPTED_EXTENSIONS, supportsExtension } from '@/features/conversion/blpyutil';
import { selectConversion } from '@/features/conversion/conversionSlice';
import {
    type FileContentSetPayload,
    fetchFileContent,
    fetchRepoContents,
    fileContentReset,
    fileContentSet,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import GithubOpenDialog from '@/features/github/GithubOpenDialog';
import { selectGithubAuthToken } from '@/features/github/githubSlice';
import { GITHUB_DOMAIN } from '@/features/github/utils';
import { CatIcon } from '@/features/icons/CatIcon';
import { DevTypeIcon } from '@/features/icons/DevTypeIcon';
import { selectTabs } from '@/features/tabs/tabsSlice';
import { Download } from 'react-bootstrap-icons';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector } from 'react-redux';

const FileSelector: React.FC<{
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ fileInputRef }) => {
    const dispatch = useAppDispatch();

    const [showModal, setShowModal] = useState(false);

    const [filesCached, setFilesCached] = useState<File[] | undefined>();
    const { additionalCommentsChecked } = useSelector(selectTabs);
    const { conversionResult } = useSelector(selectConversion);
    const fileContent = useSelector(selectFileContent);
    const githubAuthToken = useSelector(selectGithubAuthToken);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = (url?: string) => {
        setShowModal(false);
        if (url) {
            dispatch(
                fetchRepoContents({ url, builtin: false, token: githubAuthToken }),
            );
        }
        // e.g. https://github.com/afarago/2025educup-masters-attilafarago
        // e.g. https://gist.github.com/afarago/4718cffcbea66ca88f99be64fd912cd8
    };

    const openFiles = (files1: File[]) => {
        if (!files1?.length) return;

        let files2 = [...files1].sort((a, b) => a.name.localeCompare(b.name));
        // filter files to only include supported extensions
        files2 = files2.filter((file) => supportsExtension(file.name));

        const content = {
            files: files2,
            builtin: false,
        } satisfies FileContentSetPayload;
        dispatch(fileContentSet(content));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files1 = event.target.files;
        if (!files1?.length) return;

        openFiles([...files1]);
        event.target.blur();
    };

    useEffect(() => {
        // PWA open file support
        if ('launchQueue' in window) {
            (window as any).launchQueue.setConsumer(
                async (launchParams: { files: FileSystemFileHandle[] | undefined }) => {
                    if (!launchParams.files?.length) return;

                    const files1 = launchParams.files.map((fileHandle) =>
                        fileHandle.getFile(),
                    );
                    const files1a = await Promise.all(files1);
                    if (!files1a?.length) return;

                    openFiles(files1a);
                },
            );
        }
    }, [dispatch]);

    const handleFileBrowserClick = async (e: React.MouseEvent<HTMLInputElement>) => {
        // shift-click: open a directory selector (if supported)
        if (fileInputRef.current) fileInputRef.current.webkitdirectory = e.shiftKey;

        //TODO: somehow shift seems to be "stuck", after one dir selection, next seem to have shiftkey in
    };

    const handleExampleButtonDownloadClick = async () => {
        if (!filesCached) return;
        const file = filesCached[0];
        const dataUrl = URL.createObjectURL(file);
        try {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = file.name;
            link.click();
        } finally {
            // Important: Release the object URL when it's no longer needed to avoid memory leaks
            URL.revokeObjectURL(dataUrl); // Release the temporary URL after the download
        }
    };

    const handleExampleButtonOpenClick = async (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        const path = (event.target as HTMLElement).closest('a')?.dataset.file;
        if (!path) return;

        try {
            if (path.includes(GITHUB_DOMAIN)) {
                dispatch(
                    fetchRepoContents({
                        url: path,
                        builtin: true,
                        token: githubAuthToken,
                    }),
                );
            } else {
                dispatch(fetchFileContent({ url: path }));
            }
        } catch (error) {
            console.error('::ERROR::', error);
        }
    };

    useEffect(() => {
        const handleFileContentsUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const payload = customEvent.detail as FileContentSetPayload;
            setFilesCached(payload?.files);
        };

        document.addEventListener('fileContentsUpdated', handleFileContentsUpdate);
        return () => {
            document.removeEventListener(
                'fileContentsUpdated',
                handleFileContentsUpdate,
            );
        };
    }, []);

    useEffect(() => {
        // reload based on cached files, when additionalCommentsChecked/disabledFiles changed
        if (filesCached?.length) {
            const fcontent = {
                files: filesCached,
                builtin: fileContent.builtin, // just take current value into account, but do not react on this
                url: fileContent.url, // just take current value into account, but do not react on this
                disabledFiles: fileContent.disabledFiles, // refresh based on current data
            } satisfies FileContentSetPayload;
            dispatch(fileContentSet(fcontent));
        }
    }, [additionalCommentsChecked, fileContent.disabledFiles, filesCached]);

    useEffect(() => {
        // sync local cached files with file selector (especially when not picked from there), apart handleFileOpen
        if (fileInputRef?.current) {
            const dataTransfer = new DataTransfer();
            filesCached?.forEach((fc) => dataTransfer.items.add(fc));
            fileInputRef.current.files = dataTransfer.files;
        }
        if (!filesCached?.length) {
            dispatch(fileContentReset());
        }
    }, [filesCached]);

    useHotkeys(
        'control+o',
        () => fileInputRef.current?.click(),
        { preventDefault: true },
        [fileInputRef],
    );

    return (
        <div className="file-selector">
            <Form.Group controlId="file-selector" className="d-flex flex-row">
                <div className="d-flex w-100 position-relative flex-grow-1">
                    <Form.Control
                        type="file"
                        accept={ACCEPTED_EXTENSIONS}
                        multiple={true}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        onClick={handleFileBrowserClick}
                    />
                    {conversionResult && (
                        <div className="file-selector-icons position-absolute end-0 d-none d-lg-flex">
                            {conversionResult?.extra?.['blockly.slot'] !==
                                undefined && (
                                <CatIcon
                                    slot={parseInt(
                                        conversionResult?.extra?.['blockly.slot'],
                                    )}
                                />
                            )}
                            {conversionResult?.filetype && (
                                <DevTypeIcon devtype={conversionResult?.filetype} />
                            )}
                        </div>
                    )}
                </div>
                {fileContent?.builtin && (
                    <Button
                        className="btn-light mini-button flex-grow-0 d-none d-lg-block"
                        onClick={handleExampleButtonDownloadClick}
                        title="Download example file"
                    >
                        <Download scale={2} />
                    </Button>
                )}
                <Button
                    className="btn-light mini-button github-icon flex-grow-0"
                    title="Enter GitHub Repository URL"
                    onClick={handleOpenModal}
                >
                    <img src={Github} alt="github" />{' '}
                    <span className="d-none d-lg-block">Open from GitHub</span>
                </Button>
            </Form.Group>

            {/* url as info */}
            {fileContent.url && (
                <div className="small">
                    <a href={fileContent.url} target="_blank">
                        {fileContent.url}
                    </a>
                </div>
            )}

            {/* buttons for builtin example files */}
            <div className="file-examples col-sm-12 m-0 p-0 pt-1">
                <small className="d-flex flex-row flex-nowrap align-items-baseline">
                    <div className="d-none d-sm-block pe-2">
                        <b>Examples:</b>
                    </div>
                    <div className="flex-fill d-flex gap-1 flex-wrap">
                        {EXAMPLES.map((example, index) => (
                            <div key={example.file}>
                                <Badge
                                    pill
                                    data-file={example.file}
                                    onClick={handleExampleButtonOpenClick}
                                    as="a"
                                    href="#"
                                    className="example-content-button bg-light text-dark"
                                >
                                    {example.label}
                                    {typeof example.icon === 'string' ? (
                                        <DevTypeIcon devtype={example.icon} />
                                    ) : (
                                        example.icon
                                    )}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </small>
            </div>

            <GithubOpenDialog
                show={showModal}
                handleClose={handleCloseModal}
                initialUrl={fileContent.url}
            />
        </div>
    );
};

export default FileSelector;

const EXAMPLES = [
    {
        file: '/samples/demo_cityshaper_cranemission.llsp3',
        label: 'SPIKE',
        icon: 'spike',
    },
    {
        file: '/samples/demo_iconblocks.llsp3',
        label: 'SPIKE icon blocks',
        icon: 'spike',
    },
    {
        file: '/samples/demo_cityshaper_cranemission.lms',
        label: 'RobotInventor',
        icon: 'robotinventor',
    },
    {
        file: '/samples/demo_cityshaper_cranemission.lmsp',
        label: 'EV3Classroom',
        icon: 'ev3classroom',
    },
    {
        file: '/samples/demo_cityshaper_cranemission.ev3',
        label: 'EV3Lab',
        icon: 'ev3g',
    },
    {
        file: '/samples/demo_cityshaper_cranemission.rbf',
        label: 'EV3Lab binary',
        icon: 'ev3b',
    },
    {
        file: '/samples/demo_cityshaper_cranemission.py',
        label: 'Pybricks Python',
        icon: 'pybricks',
    },
    {
        file: 'https://github.com/afarago/2025educup-masters-attilafarago',
        label: 'Github Public Repo',
        icon: <img src={Github} alt="github" />,
    },
    {
        file: 'https://gist.github.com/afarago/4718cffcbea66ca88f99be64fd912cd8',
        label: 'Github Gist',
        icon: <img src={Github} alt="github" />,
    },
];
