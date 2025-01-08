// src/contexts/MyContext.tsx
import { ReactNode, createContext, useRef, useState } from 'react';

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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function toggleFullScreen(value?: boolean) {
        setFullScreen((prev) => (value === undefined ? !prev : value));
    }

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
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
