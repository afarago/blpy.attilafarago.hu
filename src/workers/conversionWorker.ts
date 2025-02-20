import {
    convertProjectToPython,
    IPyConverterFile,
    IPyConverterOptions,
} from 'blocklypy';

// worker.ts
interface ConversionWorkerInputData {
    files: File[];
    disabledFiles: string[];
    builtin: boolean | undefined;
    additionalCommentsChecked: boolean;
}

onmessage = async (event: MessageEvent<ConversionWorkerInputData>) => {
    const { files, disabledFiles, builtin, additionalCommentsChecked } = event.data;

    try {
        const inputs: IPyConverterFile[] = await Promise.all(
            files.map(async (file) => ({
                name: file.webkitRelativePath || file.name,
                buffer: disabledFiles.includes(file.name)
                    ? new ArrayBuffer(0)
                    : await file.arrayBuffer(),
                size: file.size,
                date: builtin ? undefined : new Date(file.lastModified),
            })),
        );

        const options: IPyConverterOptions = {
            debug: {
                ...(additionalCommentsChecked
                    ? {
                          showExplainingComments: true,
                          showBlockIds: true,
                      }
                    : {}),
                ...(disabledFiles ? { skipFiles: disabledFiles } : {}),
            },
            output: {
                'ev3b.source': true,
                'blockly.slot': true,
                'blockly.svg': true,
            },
        } satisfies IPyConverterOptions;
        const retval = await convertProjectToPython(inputs, options);

        delete retval.topblocks;
        delete (retval as unknown as any).topLevelStacks;
        delete (retval as unknown as any).lastModifiedDate;

        postMessage(retval);
    } catch (error: any) {
        postMessage({ error: error.message || 'An unknown error occurred.' });
    }
};

function performComplexCalculation(data: number): number {
    let sum = 0;
    for (let i = 0; i < 100000000; i++) {
        sum += data * i;
    }
    return sum;
}
