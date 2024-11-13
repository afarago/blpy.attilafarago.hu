import React, { useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useHotkeys } from 'react-hotkeys-hook';

const FileSelector: React.FC<{
    selectedFile: File | undefined;
    setSelectedFile: (file: File | undefined) => void;
}> = ({ selectedFile, setSelectedFile }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.length) setSelectedFile(target.files[0]);
        else updateFileInput(selectedFile);
    };

    const handleExampleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const path = (event.target as HTMLAnchorElement).dataset.file;
        if (!path) {
            return;
        }

        fetch(path)
            .then(async (data) => {
                const data2 = await data.blob();
                const fname = path?.split('/')?.pop();
                if (!fname) return false;
                const file = new File([data2], fname);

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                setSelectedFile(file);
            })
            .catch((error: unknown) => {
                console.error('::ERROR::', error);
            });
        return false;
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

    return (
        <div>
            <Form.Group controlId="file-selector">
                <Form.Control
                    type="file"
                    accept=".llsp,.lms,.lmsp,.llsp3,.ev3,.ev3m"
                    ref={fileInputRef}
                    onChange={handleFileOpen}
                />
            </Form.Group>

            <div className="file-examples col-sm-12 m-0 p-0 pt-1">
                <small>
                    <b>Examples:</b>
                    {[
                        {
                            file: './static/samples/demo_cityshaper_cranemission.llsp3',
                            label: 'SPIKE blocks',
                        },
                        {
                            file: './static/samples/demo_iconblocks.llsp3',
                            label: 'SPIKE icon-blocks',
                        },
                        {
                            file: './static/samples/demo_cityshaper_cranemission.lms',
                            label: 'RobotInventor blocks',
                        },
                        {
                            file: './static/samples/demo_cityshaper_cranemission.lmsp',
                            label: 'EV3Classroom blocks',
                        },
                        {
                            file: './static/samples/demo_cityshaper_cranemission.ev3',
                            label: 'EV3Lab EV3G',
                        },
                    ].map((example, index) => (
                        <Button
                            variant="link"
                            key={index}
                            className="example-content-button"
                            data-file={example.file}
                            onClick={handleExampleButtonClick}
                        >
                            {example.label}
                        </Button>
                    ))}
                </small>
            </div>
        </div>
    );
};

export default FileSelector;
