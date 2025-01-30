// src/contexts/MyContext.tsx
import { ReactNode, createContext, useEffect, useMemo, useRef, useState } from 'react';

import { IPyProjectResult } from 'blocklypy';

interface MyContextProps {
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (value: boolean) => void;
    conversionResult?: IPyProjectResult;
    setConversionResult: (value: IPyProjectResult | undefined) => void;
    toastMessage?: string;
    setToastMessage: (value: string | undefined) => void;
    selectedFileContent?: IFileContent;
    setSelectedFileContent: (value: IFileContent | undefined) => void;
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
    files: File[];
    builtin?: boolean;
}

const MyContext = createContext<MyContextProps | undefined>(undefined);

const MyProvider = ({ children }: { children: ReactNode }) => {
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        useState(false);
    const [conversionResult, setConversionResult] = useState<IPyProjectResult>();
    const [toastMessage, setToastMessage] = useState<string>();
    const [selectedFileContent, setSelectedFileContent] = useState<IFileContent>();
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
            setRbfDecompileData(conversionResult.extra?.['ev3b.source']?.['main']);
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
                    selectedFileContent,
                    setSelectedFileContent,
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
                    selectedFileContent,
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
