import React, { useEffect, useRef } from 'react';

import Badge from 'react-bootstrap/Badge';
import { DevTypeIcon } from './DevTypeIcon';
import Form from 'react-bootstrap/Form';
import { useHotkeys } from 'react-hotkeys-hook';

interface FileSelectorProps {
    selectedFile: File | undefined;
    setSelectedFile: (file: File | undefined) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({
    selectedFile,
    setSelectedFile,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.length) {
            setSelectedFile(target.files[0]);
            target.blur();
        } else {
            updateFileInput(selectedFile);
        }
    };

    const handleExampleButtonClick = async (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        const path = (event.target as HTMLAnchorElement).dataset.file;
        if (!path) return;

        try {
            const response = await fetch(path);
            const blob = await response.blob();
            const fileName = path.split('/').pop();
            if (!fileName) return;

            const file = new File([blob], fileName);
            // const dataTransfer = new DataTransfer();
            // dataTransfer.items.add(file);

            setSelectedFile(file);
        } catch (error) {
            console.error('::ERROR::', error);
        }
    };

    const updateFileInput = (file?: File) => {
        if (fileInputRef.current && file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
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
            label: 'SPIKE blocks',
            icon: 'spike',
        },
        {
            file: '/samples/demo_iconblocks.llsp3',
            label: 'SPIKE icon-blocks',
            icon: 'spike',
        },
        {
            file: '/samples/demo_cityshaper_cranemission.lms',
            label: 'RobotInventor blocks',
            icon: 'robotinventor',
        },
        {
            file: '/samples/demo_cityshaper_cranemission.lmsp',
            label: 'EV3Classroom blocks',
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
            <Form.Group controlId="file-selector">
                <Form.Control
                    type="file"
                    accept=".llsp,.lms,.lmsp,.llsp3,.ev3,.ev3m,.rbf,.py"
                    ref={fileInputRef}
                    onChange={handleFileOpen}
                />
            </Form.Group>

            <div className="file-examples col-sm-12 m-0 p-0 pt-1">
                <small className="d-flex flex-row flex-nowrap align-items-baseline">
                    <div>
                        <b>Examples:</b>
                    </div>
                    <div className="p-2 flex-fill d-flex gap-1 flex-wrap">
                        {examples.map((example, index) => (
                            <div key={example.file}>
                                <Badge
                                    pill
                                    data-file={example.file}
                                    onClick={handleExampleButtonClick}
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
