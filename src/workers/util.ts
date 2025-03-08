import { IConverstionResultExtended } from '@/features/conversion/types';
import {
    convertProjectToPython,
    IPyConverterFile,
    IPyConverterOptions,
} from 'blocklypy';

export interface IConversionInputData {
    files: File[];
    disabledFiles: string[];
    builtin: boolean | undefined;
    additionalCommentsChecked: boolean;
}

export async function processConversion(
    input: IConversionInputData,
): Promise<IConverstionResultExtended> {
    const { files, disabledFiles, builtin, additionalCommentsChecked } = input;
    const inputs0 = await Promise.all(
        files.map(async (file) => {
            try {
                return {
                    name: file.webkitRelativePath || file.name,
                    buffer: disabledFiles.includes(file.name)
                        ? new ArrayBuffer(0)
                        : await file.arrayBuffer(),
                    size: file.size,
                    date: builtin ? undefined : new Date(file.lastModified),
                };
            } catch (error) {
                // NOTE: skip errors, might be directories or other non-file objects
                console.error('Error reading file:', error);
            }
        }),
    );
    const inputs: IPyConverterFile[] = inputs0.filter((f) => f !== undefined);

    const logs = [] as string[];
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
        log: {
            // level: 0,
            callback: (level: unknown, ...args: unknown[]) => {
                const line = args.map(String).join(' ');
                logs.push(line);
            },
        },
    } satisfies IPyConverterOptions;

    const content = await convertProjectToPython(inputs, options);

    delete content.topblocks;
    delete (content as unknown as any).topLevelStacks;
    delete (content as unknown as any).lastModifiedDate;

    return { content, logs } satisfies IConverstionResultExtended;
}
