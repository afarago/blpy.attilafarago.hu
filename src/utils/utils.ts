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
