import domtoimage from 'dom-to-image';

// export function findLinesByBlockId(lines: string[], blockId: string): string[] {
//     const result: string[] = [];
//     let isMatching = false;

//     for (const line of lines) {
//         // const match = line.match(/(?:^\s*#.*@ )(.*)$/m); // Extract blockId from comment
//         const match = line.match(/^\s*#.*@ (\S+)$/m); // Extract blockId from comment
//         if (!isMatching && match) {
//             if (match?.[1] === blockId) isMatching = true;
//         }

//         if (isMatching) {
//             if (line.trim() === '') return result;
//             result.push(line);
//         }
//     }

//     return result;
// }

export function getFileExtension(fileName?: string): string {
    const dotIndex = fileName?.lastIndexOf('.');

    /* If there's no dot or it's the first character (hidden file), return an empty string */
    if (fileName === undefined || dotIndex === -1 || dotIndex === undefined) {
        return '';
    }

    return fileName.substring(dotIndex); /* Extract extension with the dot */
}

/**
 * Returns the base name of a file (without extension).
 */
export const getBaseName = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
};

/**
 * Copies the given text to the clipboard.
 */
export const copyTextToClipboard = async (text: string | undefined) => {
    try {
        if (text === undefined) return;
        await navigator.clipboard.writeText(text);
    } catch (e) {
        console.error('Clipboard copy failed:', e);
    }
};

/**
 * Downloads a Blob as a file with the given filename.
 */
export const downloadBlobAsFile = (blob: Blob, filename: string) => {
    const dataUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(dataUrl);
};

/**
 * Captures a DOM element as an image and downloads it as a file.
 */
export const downloadDomAsImage = async (element: HTMLElement, filename: string) => {
    try {
        const blob = await domtoimage.toBlob(element, {});
        downloadBlobAsFile(blob, filename);
    } catch (error) {
        console.error('Error capturing image:', error);
    }
};

// domtoimage
//     .toPng(ref.current, {})
//     .then((dataUrl: string) => {
//         const link = document.createElement('a');
//         link.href = dataUrl;
//         link.download = `${getBaseName(filename)}_${ext}.png`;
//         link.click();
//         URL.revokeObjectURL(dataUrl);
//     })
//     .catch((error) => {
//         console.error('Error capturing image:', error);
//     });

// // also put it to the clipboard
// // this would be subject to animations and might not work
// domtoimage.toBlob(ref.current, {}).then((data: Blob) => {
//     // copy image to clipboard
//     const data2: any = [
//         new ClipboardItem({
//             'image/png': data,
//         }),
//     ];
//     navigator.clipboard.write(data2);
// });
