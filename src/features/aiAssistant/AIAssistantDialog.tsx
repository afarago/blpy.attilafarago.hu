import React, { useEffect, useRef, useState } from 'react';
import { InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { getGrammarPhrases, getPhrases, parseTextCommand } from './parseCodeHelper';

type SpeechRecognition = typeof window.SpeechRecognition extends undefined
    ? typeof window.webkitSpeechRecognition
    : typeof window.SpeechRecognition;

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    readonly length: number;
    // getter SpeechRecognitionAlternative item(unsigned long index);
    readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

type SpeechRecognitionEvent = Event & {
    results: {
        [index: number]: SpeechRecognitionResult;
        length: number;
        isFinal: boolean;
    };
};

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AIAssitantDialogProps {
    handleClose: (url?: string) => void;
}

// Mock async functions
async function generatePythonCode(text: string, language: string): Promise<string> {
    // return new Promise(
    //     (resolve) =>
    //         // setTimeout(
    //         //     () => resolve(`# Python code for:\n# "${text}"\nprint("Hello, world!")`),
    //         //     0,
    //         // ),
    //         () =>
    //             resolve(parseVoiceCommand(text)),
    // );
    return parseTextCommand(text, language);
}

const LANGUAGES = [
    { code: 'en-US', label: 'English' },
    { code: 'hu-HU', label: 'Hungarian' },
];

type InputMode = 'voice' | 'text';
const INPUT_MODES = ['Text', 'Voice'];

export const AIInteractiveAssistantDialog: React.FC<AIAssitantDialogProps> = ({
    handleClose,
}) => {
    const [language, setLanguage] = useState('en-US');
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [commandInput, setCommandInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pythonCode, setPythonCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Voice input handlers
    const handleVoiceInput = () => {
        setError(null);
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setError('Speech recognition not supported in this browser.');
            return;
        }
        const SpeechRecognitionImpl =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionImpl();
        recognition.lang = language;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.phrases = getPhrases(language);
        recognition.grammars = getGrammarPhrases(language);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setCommandInput(transcript);
            if (event.results[0].isFinal) {
                setIsListening(false);
            }
        };
        recognition.onerror = (event: any) => {
            setError('Speech recognition error: ' + event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    // Generate Python code
    useEffect(() => {
        setIsGenerating(true);
        setError(null);
        async function handleCodeChange() {
            try {
                const code = await generatePythonCode(commandInput, language);
                setPythonCode(code);
            } catch (e) {
                setError('Failed to generate code.');
            } finally {
                setIsGenerating(false);
            }
        }
        handleCodeChange();
    }, [commandInput, language]);

    // Copy code
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pythonCode);
        } catch {
            setError('Failed to copy code.');
        }
    };

    return (
        <Modal
            show={true}
            onHide={handleClose}
            size="lg"
            // onShow={handleOnShow}
            // onEscapeKeyDown={handleEscapeKeyDown}
            className="GithubDialog"
        >
            <Modal.Header closeButton>
                <Modal.Title>AI Interactive Assistant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="small text-muted">
                    <i>
                        This assistant helps you convert natural language commands into
                        Python code for Pybricks. You can use voice or text input, edit
                        the generated code, and copy it to your clipboard.
                        <br/><b>Examples:</b> <code>go forward 20 cm</code>,{' '}
                        <code>move back 10 mm</code>, <code>turn left 90 degrees</code>,{' '}
                        <code>rotate right 45 deg</code>, <code>stop</code>.
                    </i>
                </div>

                <Form.Group className="mb-3">
                    <ToggleButtonGroup
                        className="me-2"
                        type="radio"
                        name="inputMode"
                        defaultValue={inputMode}
                        onChange={(value) => setInputMode(value as InputMode)}
                    >
                        {INPUT_MODES.map((mode) => (
                            <ToggleButton
                                id={mode.toLowerCase()}
                                value={mode.toLowerCase()}
                                key={mode}
                            >
                                {mode}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {inputMode === 'voice' && (
                        <>
                            <ToggleButtonGroup
                                className="me-2"
                                type="radio"
                                name="language"
                                defaultValue={language}
                                onChange={(value) => setLanguage(value as string)}
                            >
                                {LANGUAGES.map((lang) => (
                                    <ToggleButton
                                        id={lang.code}
                                        key={lang.code}
                                        onClick={(e) => setLanguage(lang.code)}
                                        value={lang.code}
                                        checked={language === lang.code}
                                    >
                                        {lang.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>

                            <Button
                                onClick={isListening ? stopListening : handleVoiceInput}
                                disabled={isGenerating}
                                className="me-2"
                            >
                                {isListening
                                    ? '🛑 Stop Listening'
                                    : '🎤 Start Voice Input'}
                            </Button>
                        </>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Natural Language Input</Form.Label>
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            aria-label="With textarea"
                            value={commandInput}
                            placeholder="Type your command here in natural language..."
                            onChange={(e) => setCommandInput(e.target.value)}
                            rows={5}
                            disabled={isListening}
                            className='small'
                        />
                    </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Generated Python Code</Form.Label>
                    <Form.Control
                        value={pythonCode}
                        readOnly
                        as="textarea"
                        rows={20}
                        style={{ fontFamily: 'monospace' }}
                        onChange={(e) => setPythonCode(e.target.value)}
                        className='small'
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleCopy} disabled={!pythonCode}>
                    Copy Code
                </Button>
                {error && (
                    <div style={{ color: '#b94a48', marginTop: 8, fontWeight: 500 }}>
                        {error}
                    </div>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default AIInteractiveAssistantDialog;
