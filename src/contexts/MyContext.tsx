// src/contexts/MyContext.tsx
import React, { ReactNode, createContext, useState } from 'react';

import { PyProjectResult } from 'blocklypy';

interface MyContextProps {
    isAdditionalCommentsChecked: boolean;
    setIsAdditionalCommentsChecked: (value: boolean) => void;
    conversionResult?: PyProjectResult;
    setConversionResult: (value?: PyProjectResult) => void;
    toastMessage?: string;
    setToastMessage: (value?: string) => void;
    filename?: string;
    setFilename: (value?: string) => void;
}

const MyContext = createContext<MyContextProps | undefined>(undefined);

const MyProvider = ({ children }: { children: ReactNode }) => {
    const [isAdditionalCommentsChecked, setIsAdditionalCommentsChecked] =
        useState(false);
    const [conversionResult, setConversionResult] = useState<PyProjectResult>();
    const [toastMessage, setToastMessage] = useState<string>();
    const [filename, setFilename] = useState<string>();

    return (
        <MyContext.Provider
            value={{
                isAdditionalCommentsChecked,
                setIsAdditionalCommentsChecked,
                conversionResult,
                setConversionResult,
                toastMessage,
                setToastMessage,
                filename,
                setFilename,
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
