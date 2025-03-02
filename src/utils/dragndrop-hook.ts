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
        async (event: React.DragEvent<HTMLDivElement>) => {
            event.stopPropagation();
            event.preventDefault();
            setIsDragging(false);

            const items = event.dataTransfer.items;
            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const entry = item.webkitGetAsEntry() as FileSystemEntry | null;

                if (entry) {
                    if (entry.isDirectory) {
                        const files1 = await processDirectory(
                            entry as FileSystemDirectoryEntry,
                        );
                        files.push(...files1);
                    } else if (entry.isFile) {
                        const file1 = await processFile(entry as FileSystemFileEntry);
                        files.push(file1);
                    }
                }
            }

            // const files =
            //     event.dataTransfer && event.dataTransfer.files
            //         ? [...event.dataTransfer.files]
            //         : [];

            setFilesFn(files);
        },
        [setFilesFn],
    );

    return { isDragging, handleDragOver, handleDragLeave, handleDrop };
};

async function processDirectory(
    directoryEntry: FileSystemDirectoryEntry,
): Promise<File[]> {
    return new Promise<File[]>((resolve, reject) => {
        const directoryReader = directoryEntry.createReader();
        const files: File[] = [];

        directoryReader.readEntries(
            async (entries: FileSystemEntry[]) => {
                for (const entry of entries) {
                    if (!entry || entry.name.startsWith('.')) continue;
                    if (entry.isDirectory) {
                        const nestedFiles = await processDirectory(
                            entry as FileSystemDirectoryEntry,
                        );
                        files.push(...nestedFiles);
                    } else if (entry.isFile) {
                        const file = await processFile(entry as FileSystemFileEntry);
                        files.push(file);
                    }
                }
                resolve(files);
            },
            (error: DOMException) => {
                console.error('Error reading directory:', error);
                reject(error);
            },
        );
    });
}

async function processFile(fileEntry: FileSystemFileEntry): Promise<File> {
    return new Promise<File>((resolve, reject) => {
        fileEntry.file(
            (file: File) => resolve(new File([file], fileEntry.fullPath)),
            (error: DOMException) => reject(error),
        );
    });
}
