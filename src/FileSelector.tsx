import React, { useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const FileSelector: React.FC<{
    selectedFile: File | undefined;
    setSelectedFile: (file: File | undefined) => void;
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (checked: boolean) => void;
}> = ({
    selectedFile,
    setSelectedFile,
    isAdditionalCommentsChecked,
    setIsAdditionalCommentsChecked,
}) => {
        const fileInputRef = useRef<HTMLInputElement | null>(null);
        // const [lastFile, setLastFile] = React.useState<File | undefined>(undefined);

        const handleAdditionalCommentsChange = (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            setIsAdditionalCommentsChecked(event.target.checked);
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

                    // ($('#file-selector').get(0) as HTMLInputElement).files =
                    //     dataTransfer.files;
                    setSelectedFile(file);
                })
                .catch((error: unknown) => {
                    console.error('::ERROR::', error);
                });
            return false;
        };

        useEffect(() => {
            if (fileInputRef.current && selectedFile) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedFile);
                fileInputRef.current.files = dataTransfer.files;
            }
        }, [selectedFile]);

        return (
            <div>
                <Form.Group controlId="file-selector">
                    <Form.Control
                        type="file"
                        accept=".llsp,.lms,.lmsp,.llsp3,.ev3,.ev3m"
                        ref={fileInputRef}
                        onChange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.files) setSelectedFile(target.files[0]);
                        }}
                    />
                </Form.Group>

                <div className="col-sm-12 m-0 p-0 pt-1 fileptions">
                    <small>
                        <b>Examples:</b>
                        {[
                            {
                                file: './static/samples/demo_cityshaper_cranemission.llsp3',
                                label: 'SPIKE block sample',
                            },
                            {
                                file: './static/samples/demo_cityshaper_cranemission.lmsp',
                                label: 'EV3Classroom sample',
                            },
                            {
                                file: './static/samples/demo_cityshaper_cranemission.ev3',
                                label: 'EV3Lab sample',
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
                    <small>
                        <Form.Check
                            type="switch"
                            id="additionalCommentsCheck"
                            label="Explanatory&nbsp;Comments"
                            checked={isAdditionalCommentsChecked}
                            onChange={handleAdditionalCommentsChange}
                        />
                    </small>
                </div>
            </div>
        );
    };

export default FileSelector;
