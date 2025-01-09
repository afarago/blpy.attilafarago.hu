// src/contexts/MyContext.tsx
import { ReactNode, createContext, useEffect, useRef, useState } from 'react';

import { PyProjectResult } from 'blocklypy';

interface MyContextProps {
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (value: boolean) => void;
    conversionResult?: PyProjectResult;
    setConversionResult: (value: PyProjectResult | undefined) => void;
    toastMessage?: string;
    setToastMessage: (value: string | undefined) => void;
    selectedFile?: IFileContent;
    setSelectedFile: (value: IFileContent | undefined) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    fullScreen?: boolean;
    toggleFullScreen: (value?: boolean) => void;
    svgContentData: string | undefined;
    rbfDecompileData: string | undefined;
}

export interface IFileContent {
    file: File;
    builtin?: boolean;
}

const MyContext = createContext<MyContextProps | undefined>(undefined);

const MyProvider = ({ children }: { children: ReactNode }) => {
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        useState(false);
    const [conversionResult, setConversionResult] = useState<PyProjectResult>();
    const [toastMessage, setToastMessage] = useState<string>();
    const [selectedFile, setSelectedFile] = useState<IFileContent>();
    const [fullScreen, setFullScreen] = useState<boolean>();
    const [svgContentData, setSvgContentData] = useState<string>();
    const [rbfDecompileData, setRbfDecompileData] = useState<string>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const toggleFullScreen = (value?: boolean) => {
        setFullScreen((prev) => (value === undefined ? !prev : value));
    };

    useEffect(() => {
        if (conversionResult) {
            setSvgContentData(conversionResult.extra?.['blockly.svg']);
            setRbfDecompileData(conversionResult.extra?.['ev3b.decompiled']);
        }
    }, [conversionResult]);

    return (
        <MyContext.Provider
            value={{
                isAdditionalCommentsChecked,
                setIsAdditionalCommentsChecked,
                conversionResult,
                setConversionResult,
                toastMessage,
                setToastMessage,
                selectedFile,
                setSelectedFile,
                fileInputRef,
                fullScreen,
                toggleFullScreen,
                svgContentData,
                rbfDecompileData,
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
