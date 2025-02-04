import React, { useEffect, useState } from 'react';

import { ACCEPTED_EXTENSIONS } from '@/utils/constants';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { CatIcon } from '@/features/icons/CatIcon';
import { DevTypeIcon } from '@/features/icons/DevTypeIcon';
import { Download } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch } from '@/app/hooks';
import { selectTabs } from '@/features/tabs/tabsSlice';
import {
    type FileContentSetPayload,
    fileContentSet,
    fileContentReset,
    selectFileContent,
} from '@/features/fileContent/fileContentSlice';
import { selectConversionResult } from '@/features/conversion/conversionSlice';
import { useSelector } from 'react-redux';

const FileSelector: React.FC<{
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ fileInputRef }) => {
    const dispatch = useAppDispatch();

    const [filesCached, setFilesCached] = useState<File[] | undefined>();

    const { additionalCommentsChecked } = useSelector(selectTabs);
    const conversionResult = useSelector(selectConversionResult);
    const fileContent = useSelector(selectFileContent);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.length) {
            let files = [...target.files].sort((a, b) => a.name.localeCompare(b.name));
            // filter files to only include supported extensions
            if (files.length > 1) {
                const files1 = files.filter((file) =>
                    ACCEPTED_EXTENSIONS.includes(file.name.split('.').pop() || ''),
                );
                if (files1.length) files = files1;
            }
            const content = {
                files,
                builtin: false,
                additionalCommentsChecked,
            } satisfies FileContentSetPayload;
            dispatch(fileContentSet(content));
            target.blur();
        } else {
            dispatch(fileContentReset());
        }
    };

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
            const response = await fetch(path);
            const blob = await response.blob();
            const fileName = path.split('/').pop();
            if (!fileName) return;

            const file = new File([blob], fileName);
            const fcontent = {
                files: [file],
                builtin: true,
                additionalCommentsChecked,
            } satisfies FileContentSetPayload;

            // setFilesCached([file]);
            dispatch(fileContentSet(fcontent));
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
        if (filesCached?.length) {
            const fcontent = {
                files: filesCached,
                builtin: false,
                additionalCommentsChecked,
            } satisfies FileContentSetPayload;
            dispatch(fileContentSet(fcontent));
        } else {
            dispatch(fileContentReset());
        }
    }, [additionalCommentsChecked, filesCached]);

    useEffect(() => {
        // sync local cached files with file selector (especially when not picked from there), apart handleFileOpen
        if (fileInputRef?.current) {
            const dataTransfer = new DataTransfer();
            filesCached?.forEach((fc) => dataTransfer.items.add(fc));
            fileInputRef.current.files = dataTransfer.files;
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
                <Form.Control
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    multiple={true}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    onClick={handleFileBrowserClick}
                />
                {conversionResult && (
                    <div className="file-selector-icons">
                        {conversionResult?.extra?.['blockly.slot'] !== undefined && (
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
                {fileContent?.builtin && (
                    <Button
                        className="btn-light mini-button"
                        onClick={handleExampleButtonDownloadClick}
                        title="Download example file"
                    >
                        <Download />
                    </Button>
                )}
            </Form.Group>

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
                                    <DevTypeIcon devtype={example.icon} />
                                </Badge>
                            </div>
                        ))}
                    </div>
                </small>
            </div>
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
];
