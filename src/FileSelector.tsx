import React, { useEffect, useRef } from 'react';

import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
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
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

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
            file: './static/samples/demo_cityshaper_cranemission.llsp3',
            label: 'SPIKE blocks',
            icon: './static/img/devtype_spike.png',
            alt: 'LEGO SPIKE',
        },
        {
            file: './static/samples/demo_iconblocks.llsp3',
            label: 'SPIKE icon-blocks',
            icon: './static/img/devtype_spike.png',
            alt: 'LEGO SPIKE Icon Blocks',
        },
        {
            file: './static/samples/demo_cityshaper_cranemission.lms',
            label: 'RobotInventor blocks',
            icon: './static/img/devtype_robotinventor.png',
            alt: 'LEGO Robot Inventor',
        },
        {
            file: './static/samples/demo_cityshaper_cranemission.lmsp',
            label: 'EV3Classroom blocks',
            icon: './static/img/devtype_ev3classroom.png',
            alt: 'LEGO EV3 Classroom',
        },
        {
            file: './static/samples/demo_cityshaper_cranemission.ev3',
            label: 'EV3Lab EV3G',
            icon: './static/img/devtype_ev3g.png',
            alt: 'LEGO EV3 Lab',
        },
        {
            file: './static/samples/demo_cityshaper_cranemission.rbf',
            label: 'EV3Lab RBF',
            icon: './static/img/devtype_ev3b.png',
            alt: 'LEGO EV3 Lab Binary',
        },
    ];

    return (
        <div>
            <Form.Group controlId="file-selector">
                <Form.Control
                    type="file"
                    accept=".llsp,.lms,.lmsp,.llsp3,.ev3,.ev3m,.rbf"
                    ref={fileInputRef}
                    onChange={handleFileOpen}
                />
            </Form.Group>

            <div className="file-examples col-sm-12 m-0 p-0 pt-1">
                <small>
                    <Stack direction="horizontal" gap={2}>
                        <b>Examples:</b>
                        {examples.map((example, index) => (
                            <div key={example.file}>
                                <Badge
                                    pill
                                    // key={example.file}
                                    data-file={example.file}
                                    // bg="primary"
                                    onClick={handleExampleButtonClick}
                                    as="a"
                                    href="#"
                                    className="example-content-button"
                                >
                                    {example.label}
                                    <img
                                        src={example.icon}
                                        alt={example.alt}
                                        title={example.alt}
                                    />
                                </Badge>
                            </div>
                        ))}
                    </Stack>
                </small>
            </div>
        </div>
    );
};

export default FileSelector;
