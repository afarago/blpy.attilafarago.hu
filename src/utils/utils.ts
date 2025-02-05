export function findLinesByBlockId(lines: string[], blockId: string): string[] {
    const result: string[] = [];
    let isMatching = false;

    for (const line of lines) {
        const match = line.match(/(?:^\s*#.*@ )(.*)$/m); // Extract blockId from comment
        if (!isMatching && match) {
            if (match?.[1] === blockId) isMatching = true;
        }

        if (isMatching) {
            if (line.trim() === '') return result;
            result.push(line);
        }
    }

    return result;
}

export function getFileExtension(fileName?: string): string {
    const dotIndex = fileName?.lastIndexOf('.');

    /* If there's no dot or it's the first character (hidden file), return an empty string */
    if (
        fileName === undefined ||
        dotIndex === -1 ||
        dotIndex === 0 ||
        dotIndex === undefined
    ) {
        return '';
    }

    return fileName.substring(dotIndex); /* Extract extension with the dot */
}
