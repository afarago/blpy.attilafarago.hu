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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
