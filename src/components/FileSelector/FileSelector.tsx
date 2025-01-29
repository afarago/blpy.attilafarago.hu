import { IFileContent, MyContext } from '../../contexts/MyContext';
import React, { useContext, useEffect, useMemo } from 'react';

import { ACCEPTED_EXTENSIONS } from '../../utils/constants';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { CatIcon } from '../Icons/CatIcon';
import { DevTypeIcon } from '../Icons/DevTypeIcon';
import { Download } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import { openDirectory as pickDirectoryGetFiles } from './util';
import { useHotkeys } from 'react-hotkeys-hook';

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
]

interface FileSelectorProps {
    selectedFileContent: IFileContent | undefined;
    setSelectedFileContent: (content: IFileContent | undefined) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({
    selectedFileContent,
    setSelectedFileContent,
}) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { fileInputRef, conversionResult } = context;
    // const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.length) {
            setSelectedFileContent({ files: [...target.files], builtin: false });
            target.blur();
        } else {
            updateFileInput(selectedFileContent);
        }
    };

    const handleFileBrowserClick = async (event: React.MouseEvent<HTMLInputElement>) => {
        // shift-click: open a directory selector (if supported)
        if (event.shiftKey) {
            event.preventDefault();
            const files = await pickDirectoryGetFiles();
            if (files) setSelectedFileContent({ files, builtin: false });
        }
    };

    const handleExampleButtonDownloadClick = async () => {
        if (!selectedFileContent) return;

        const file = selectedFileContent.files[0];
        const dataUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = file.name;
        link.click();

        // Important: Release the object URL when it's no longer needed to avoid memory leaks
        URL.revokeObjectURL(dataUrl); // Release the temporary URL after the download
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

            const fcontent = { files: [new File([blob], fileName)], builtin: true };
            // const dataTransfer = new DataTransfer();
            // dataTransfer.items.add(file);

            setSelectedFileContent(fcontent);
        } catch (error) {
            console.error('::ERROR::', error);
        }
    };

    const updateFileInput = (content?: IFileContent) => {
        if (fileInputRef.current && content?.files) {
            const dataTransfer = new DataTransfer();
            [...content.files].forEach((file) => dataTransfer.items.add(file));
            fileInputRef.current.files = dataTransfer.files;
        }
    };

    useEffect(() => {
        updateFileInput(selectedFileContent);
    }, [selectedFileContent]);

    useHotkeys('control+o', () => fileInputRef.current?.click(), { preventDefault: true }, [
        fileInputRef,
    ]);

    return (
        <div className="file-selector">
            <Form.Group controlId="file-selector" className="d-flex flex-row">
                <Form.Control
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    multiple={true}
                    ref={fileInputRef}
                    onChange={handleFileOpen}
                    onClick={handleFileBrowserClick}
                />
                {conversionResult && (
                    <div className="file-selector-icons">
                        {conversionResult?.extra?.['blockly.slot'] !== undefined && (
                            <CatIcon slot={conversionResult?.extra?.['blockly.slot']} />
                        )}
                        {conversionResult?.filetype && (
                            <DevTypeIcon devtype={conversionResult?.filetype} />
                        )}
                    </div>
                )}
                {selectedFileContent?.builtin && (
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
