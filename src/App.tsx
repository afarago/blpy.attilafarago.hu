import './App.scss';

import { PyConverterOptions, PyProjectResult, convertProjectToPython } from 'blocklypy';
import React, { useCallback, useEffect, useState } from 'react';

import DummyTab from './TabWelcome';
import FileSelector from './FileSelector';
import Footer from './Footer';
// import Groq from 'groq-sdk';
import Header from './Header';
import MainTab from './TabMain';
import Toast from 'react-bootstrap/Toast';
import classNames from 'classnames';

const useDragAndDrop = (
    setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>,
) => {
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
            setSelectedFile(event.dataTransfer?.files[0]);
        },
        [setSelectedFile],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

const getBrowserLanguage = () => {
    // Access the user's preferred language from the navigator object
    const userLanguage = navigator.language || navigator.language;

    // Return the language code, handling potential undefined values
    return userLanguage || 'en'; // Default to English if language is not detected
};

async function convertFileToPython(
    file: File,
    isAdditionalCommentsChecked: boolean,
): Promise<PyProjectResult | undefined> {
    try {
        const input = await file.arrayBuffer();
        const options: PyConverterOptions = {
            filename: file.name,
            debug: isAdditionalCommentsChecked ? { showExplainingComments: true } : {},
        };
        return await convertProjectToPython(input, options);
    } catch (error) {
        console.error('Error converting project to Python:', error);
        // setToastMessage(
        //     error instanceof Error
        //         ? `${error.message} - ${file.name}`
        //         : 'An unknown error occurred.',
        // );
        return undefined;
    }
}

async function generateCodeSummary(
    code: PyProjectResult,
): Promise<AISummary | undefined> {
    try {
        const GROQ_API_KEY = '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'; //process.env.GROQ_API_KEY;
        const prompt =
            'Summarize the functionality in one extended sentences in first line, then detail it out with 5-20 bullet points using "*" tickmarks.' +
            `You answer in "${getBrowserLanguage()}".` +
            'Flipper word means LEGO Robot.' +
            'Output should be plain unformatted text.\r\n\r\n' +
            code.plaincode;

        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.2-90b-text-preview',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }),
            },
        );
        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }
        const chat_completion = await response.json();
        const chatresult = chat_completion?.choices[0]?.message?.content;
        if (!chatresult) throw new Error('Failed to fetch summary');

        // const groq = new Groq({
        //     apiKey: GROQ_API_KEY,
        //     dangerouslyAllowBrowser: true,
        // });
        // const chat_completion = await groq.chat.completions.create({
        //     messages: [
        //         {
        //             role: 'user',
        //             content: prompt,
        //         },
        //     ],
        //     // model: 'llama3-8b-8192',
        //     model: 'llama-3.2-90b-text-preview',
        //     // model: 'mixtral-8x7b-32768',
        //     // response_format: { type: 'json_object' },
        // });
        // const chatresult = chat_completion?.choices[0]?.message?.content as string;
        const shortsummary = chatresult?.split('\n')[0];
        const longsummary = chatresult;

        const result: AISummary = { shortsummary, longsummary };
        return result;
    } catch (error) {
        console.error('Error summarizing code:', error);
    }
}

export interface AISummary {
    shortsummary: string;
    longsummary: string;
}

const App: React.FC = () => {
    const [isInitial, setIsInitial] = useState(true);
    const [pyProjectResult, setPyProjectResult] = useState<PyProjectResult>();
    const [filename, setFilename] = useState<string>();
    const [aiSummary, setAiSummary] = useState<AISummary>();
    const [svgContent, setSvgContent] = useState<string>();
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        useState(false);
    const [toastMessage, setToastMessage] = useState<string>();

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragAndDrop(setSelectedFile);

    const handleFileUpload = useCallback(
        async (file: File) => {
            const result = await convertFileToPython(file, isAdditionalCommentsChecked);

            setPyProjectResult(result);
            if (file.name !== filename) setAiSummary(undefined);
            setIsInitial(result === undefined);
            setSvgContent(result?.additionalFields?.blockly?.svg);
            setFilename(file.name);
        },
        [isAdditionalCommentsChecked, filename],
    );

    useEffect(() => {
        if (selectedFile) {
            handleFileUpload(selectedFile);
        }
    }, [selectedFile, handleFileUpload]);

    const triggerGenerateCodeSummary = useCallback(async () => {
        generateCodeSummary(pyProjectResult!).then((summary) => {
            setAiSummary(summary);
        });
    }, [pyProjectResult]);

    return (
        <div className="App d-flex flex-column flex-fill">
            <Header />
            <Toast
                onClose={() => setToastMessage(undefined)}
                show={toastMessage !== undefined}
                delay={5000}
                autohide
                className="position-fixed top-0 end-0"
            >
                <Toast.Header>
                    <span className="me-auto">Conversion Error</span>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>

            <div className="container d-flex flex-column flex-fill">
                <h3>
                    SPIKE to Pybricks Wizard{' '}
                    <small className="text-muted">
                        word-block converter to Pybricks python code
                    </small>
                </h3>

                <form
                    method="post"
                    encType="multipart/form-data"
                    className="d-flex flex-column flex-fill"
                >
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={classNames(
                            'main-content',
                            'dropzone',
                            'container',
                            'pt-3',
                            'd-flex',
                            'flex-column',
                            'flex-fill',
                            {
                                'drop-active': isDragging,
                            },
                        )}
                    >
                        <FileSelector
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                        ></FileSelector>
                        <DummyTab isInitial={isInitial}></DummyTab>
                        <MainTab
                            isInitial={isInitial}
                            svgContent={svgContent}
                            pyProjectResult={pyProjectResult}
                            aiSummary={aiSummary}
                            isAdditionalCommentsChecked={isAdditionalCommentsChecked}
                            setIsAdditionalCommentsChecked={
                                setIsAdditionalCommentsChecked
                            }
                            selectedFile={selectedFile}
                            triggerGenerateCodeSummary={triggerGenerateCodeSummary}
                        ></MainTab>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default App;
