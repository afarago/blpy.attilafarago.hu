import {
    convertProjectToPython,
    IPyConverterFile,
    IPyConverterOptions,
    IPyProjectResult,
} from 'blocklypy';

export interface IConversionInputData {
    files: File[];
    disabledFiles: string[];
    builtin: boolean | undefined;
    additionalCommentsChecked: boolean;
}

export async function processConversion(
    input: IConversionInputData,
): Promise<IPyProjectResult> {
    const { files, disabledFiles, builtin, additionalCommentsChecked } = input;
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
            'wedo2.preview': true,
        },
    } satisfies IPyConverterOptions;
    const retval = await convertProjectToPython(inputs, options);

    delete retval.topblocks;
    delete (retval as unknown as any).topLevelStacks;
    delete (retval as unknown as any).lastModifiedDate;

    return retval;
}
