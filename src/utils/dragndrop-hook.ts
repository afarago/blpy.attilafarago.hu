import { useCallback, useState } from 'react';

export const useDragAndDrop = (setFilesFn: (files: File[]) => void) => {
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
            const files =
                event.dataTransfer && event.dataTransfer.files
                    ? [...event.dataTransfer.files]
                    : [];
            setFilesFn(files);
        },
        [setFilesFn],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};
