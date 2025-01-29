async function pickDirectoryGetFiles(mode: string = 'read') {
    // Feature detection. The API needs to be supported
    // and the app not run in an iframe.
    const supportsFileSystemAccess =
        'showDirectoryPicker' in window &&
        (() => {
            try {
                return window.self === window.top;
            } catch {
                return false;
            }
        })();

    // If the File System Access API is supported…
    if (supportsFileSystemAccess) {
        let directoryStructure = undefined;

        // Recursive function that walks the directory structure.
        const getFiles = async (
            dirHandle: FileSystemDirectoryHandle,
            path = dirHandle.name,
        ): Promise<File[]> => {
            const files: File[] = [];
            const values = (dirHandle as unknown as any).values();

            for await (const entry of values) {
                const nestedPath = `${path}/${entry.name}`;
                if (entry.kind === 'file') {
                    const file: File = await entry.getFile();
                    // file.name = nestedPath;
                    files.push(file);
                    // file.directoryHandle = dirHandle;
                    // file.handle = entry;
                    Object.defineProperty(file, 'webkitRelativePath', {
                        configurable: true,
                        enumerable: true,
                        get: () => nestedPath,
                    });
                } else if (entry.kind === 'directory') {
                    const files2 = await getFiles(
                        entry as FileSystemDirectoryHandle,
                        nestedPath,
                    );
                    files.push(...files2);
                }
            }
            return files;
        };

        try {
            // Open the directory.
            const handle = await (<any>window).showDirectoryPicker({
                mode,
            });
            // Get the directory structure.
            directoryStructure = await getFiles(handle, undefined);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error(err.name, err.message);
            }
        }
        return directoryStructure;
    }
}

export { pickDirectoryGetFiles };
