import { IConverstionResultExtended } from '@/features/conversion/types';
import {
    convertProjectToPython,
    IPyConverterFile,
    IPyConverterOptions,
} from 'blocklypy';

export interface IConversionInputData {
    files: File[];
    disabledFiles: string[];
    builtin?: boolean;
    additionalCommentsChecked: boolean;
    rawsource?: boolean | number | string;
}

export async function processConversion(
    config: IConversionInputData,
): Promise<IConverstionResultExtended> {
    const { files, disabledFiles, builtin, additionalCommentsChecked, rawsource } =
        config;
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
                : { skipRegionComments: true }),
            ...(disabledFiles ? { skipFiles: disabledFiles } : {}),
        },
        output: {
            'blockly.slot': true,
            'blockly.svg': true,
            'wedo2.preview': true,
            'ev3b.source': rawsource
                ? typeof rawsource === 'boolean'
                    ? 3
                    : typeof rawsource === 'string'
                    ? parseInt(rawsource)
                    : rawsource
                : false,
            'ev3g.source': rawsource !== undefined,
            'sb3.source': rawsource !== undefined,
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
