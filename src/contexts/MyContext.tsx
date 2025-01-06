// src/contexts/MyContext.tsx
import { ReactNode, createContext, useState } from 'react';

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
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
