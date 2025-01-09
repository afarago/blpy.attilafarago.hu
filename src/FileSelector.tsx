import { IFileContent, MyContext } from './contexts/MyContext';
import React, { useContext, useEffect, useRef } from 'react';

import { ACCEPTED_EXTENSIONS } from './constants';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/esm/Button';
import { DevTypeIcon } from './DevTypeIcon';
import { Download } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import ReactGA from 'react-ga4';
import { useHotkeys } from 'react-hotkeys-hook';

interface FileSelectorProps {
    selectedFile: IFileContent | undefined;
    setSelectedFile: (file: IFileContent | undefined) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({
    selectedFile,
    setSelectedFile,
}) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { fileInputRef } = context;
    // const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.length) {
            const file = target.files[0];
            setSelectedFile({ file: target.files[0], builtin: false });
            target.blur();
        } else {
            updateFileInput(selectedFile);
        }
    };

    const handleExampleButtonDownloadClick = async () => {
        if (!selectedFile) return;

        const dataUrl = URL.createObjectURL(selectedFile.file);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = selectedFile.file.name;
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

            const file = { file: new File([blob], fileName), builtin: true };
            // const dataTransfer = new DataTransfer();
            // dataTransfer.items.add(file);

            setSelectedFile(file);
        } catch (error) {
            console.error('::ERROR::', error);
        }
    };

    const updateFileInput = (file?: IFileContent) => {
        if (fileInputRef.current && file?.file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file.file);
            fileInputRef.current.files = dataTransfer.files;
        }
    };

    useEffect(() => {
        updateFileInput(selectedFile);
    }, [selectedFile]);

    useHotkeys('mod+o', () => fileInputRef.current?.click(), { preventDefault: true }, [
        fileInputRef,
    ]);

    const examples = [
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
            label: 'EV3Lab EV3G',
            icon: 'ev3g',
        },
        {
            file: '/samples/demo_cityshaper_cranemission.rbf',
            label: 'EV3Lab RBF',
            icon: 'ev3b',
        },
        {
            file: '/samples/demo_cityshaper_cranemission.py',
            label: 'Pybricks Python',
            icon: 'pybricks',
        },
    ];

    return (
        <div>
            <Form.Group controlId="file-selector" className="d-flex flex-row">
                <Form.Control
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    ref={fileInputRef}
                    onChange={handleFileOpen}
                />
                {selectedFile?.builtin && (
                    <Button
                        className="btn-light mini-button"
                        onClick={handleExampleButtonDownloadClick}
                        title="Download example file"
                    >
                        <Download />
                    </Button>
                )}
            </Form.Group>

            <div className="file-examples col-sm-12 m-0 p-0 pt-1">
                <small className="d-flex flex-row flex-nowrap align-items-baseline">
                    <div className="d-none d-sm-block pe-2">
                        <b>Examples:</b>
                    </div>
                    <div className="flex-fill d-flex gap-1 flex-wrap">
                        {examples.map((example, index) => (
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
