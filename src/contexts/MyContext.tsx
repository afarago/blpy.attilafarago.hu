// src/contexts/MyContext.tsx
import { ReactNode, createContext, useEffect, useMemo, useRef, useState } from 'react';

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
    svgDependencyGraph: string | undefined;
    setSvgDependencyGraph: (value: string | undefined) => void;
    rbfDecompileData: string | undefined;
    isCopying: boolean;
    setIsCopying: (value: boolean) => void;
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
    const [svgDependencyGraph, setSvgDependencyGraph] = useState<string>();
    const [rbfDecompileData, setRbfDecompileData] = useState<string>();
    const [isCopying, setIsCopying] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const toggleFullScreen = (value?: boolean) => {
        setFullScreen((prev) => value ?? !prev);
    };

    useEffect(() => {
        if (conversionResult) {
            setSvgContentData(conversionResult.extra?.['blockly.svg']);
            setRbfDecompileData(conversionResult.extra?.['ev3b.decompiled']);
        } else {
            setSvgContentData(undefined);
            setRbfDecompileData(undefined);
        }
    }, [conversionResult]);

    return (
        <MyContext.Provider
            value={useMemo(
                () => ({
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
                    svgDependencyGraph,
                    setSvgDependencyGraph,
                    rbfDecompileData,
                    setIsCopying,
                    isCopying,
                }),
                [
                    isAdditionalCommentsChecked,
                    conversionResult,
                    toastMessage,
                    selectedFile,
                    fullScreen,
                    svgContentData,
                    svgDependencyGraph,
                    rbfDecompileData,
                    isCopying,
                ],
            )}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
