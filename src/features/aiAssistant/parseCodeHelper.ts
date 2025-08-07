declare global {
    interface Window {
        SpeechGrammarList: any;
        webkitSpeechGrammarList: any;
    }
}

export function getGrammarPhrases(
    lang: string = 'en-US',
): SpeechGrammarList | undefined {
    if (!('webkitSpeechGrammarList' in window || 'SpeechGrammarList' in window)) return;

    const SpeechGrammarListImpl =
        (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

    // Wrap each grammar string in an object that implements SpeechGrammar
    let grammars: string[] = [];
    if (lang === 'en-US') {
        grammars = [
            '#JSGF V1.0; grammar move; public <move> = (go | drive | move | forward | backward | back) [forward | backward | back] <number> [cm | mm | centimeter | centimeters | millimeter | millimeters | second | seconds | s | sec];',
            '#JSGF V1.0; grammar turn; public <turn> = (turn | rotate | left | right) [left | right] [<number>] [degrees | degree | deg | d];',
            '#JSGF V1.0; grammar stop; public <stop> = (stop | halt);',
        ];
    } else if (lang === 'hu-HU') {
        grammars = [
            '#JSGF V1.0; grammar mozgas; public <mozgas> = (menj | mozog | előre | hátra) [előre | hátra] <szám> [cm | centi | centiméter | mm | milli | milliméter | másodperc | másodpercet];',
            '#JSGF V1.0; grammar fordul; public <fordul> = (fordulj | balra | jobbra) [balra | jobbra] [<szám>] [fok | fokot];',
            '#JSGF V1.0; grammar allj; public <allj> = (állj);',
        ];
    }
    const list = new SpeechGrammarListImpl();
    for (const grammar of grammars) {
        list.addFromString(grammar, 1);
    }
    return list;
}

export function getPhrases(lang: string = 'en-US'): string[] | undefined {
    if (lang === 'en-US') {
        return [
            'go',
            'drive',
            'move',
            'forward',
            'backward',
            'back',
            'turn',
            'rotate',
            'left',
            'right',
            'stop',
            'halt',
            'second',
            'seconds',
            'degrees',
            'degree',
            'cm',
            'centimeter',
            'mm',
            'millimeter',
        ];
    } else if (lang === 'hu-HU') {
        return [
            'menj',
            'mozog',
            'előre',
            'hátra',
            'fordulj',
            'balra',
            'jobbra',
            'állj',
            'másodperc',
            'másodpercet',
            'fok',
            'fokot',
        ];
    }
}

export function parseTextCommand(command: string, lang: string = 'en-US'): string {
    const HEADER_CODE = `
from pybricks.hubs import PrimeHub
from pybricks.parameters import Stop, Port, Direction
from pybricks.pupdevices import Motor
from pybricks.robotics import DriveBase
from pybricks.tools import StopWatch, wait

hub = PrimeHub()
motor_a = Motor(Port.A, Direction.COUNTERCLOCKWISE)
motor_b = Motor(Port.B)
bot = DriveBase(motor_a, motor_b, 55.7, 117)

`.trimStart();

    // Support multi-line input: parse each line and join results
    return (
        HEADER_CODE +
        command
            .split('\n')
            .flatMap((line) => parseSingleLineCommand(line, lang))
            .join('\n')
    );
}

function parseSingleLineCommand(
    line: string,
    lang: string = 'en-US',
): string[] | undefined {
    line = line.toLowerCase().trim();

    const patterns: {
        pattern: RegExp;
        template: (match: RegExpMatchArray) => string | undefined;
    }[] = [
        // Move (optional direction) distance (cm, mm) OR time (seconds)
        {
            // Matches:
            // "go 10", "forward 20 cm", "move back 30 mm", "drive forward 42"
            // Only matches if at least verb or direction is present
            pattern:
                /^(?:(?<action>go|drive|move|menj)(?:\s+(?<direction>forward|backward|back|előre|hátra))?|(?<direction_only>forward|backward|back|előre|hátra))\s*(?<value>\d+)?\s*(?:(?<unit>cms?|mms?|seconds?|secs?|s|centimétert?|centit?|mpt?|másodperc(et)?)?)?/i,
            template: (match) => {
                const { action, direction, direction_only, value, unit } =
                    match.groups!;
                if (!action && !direction && !direction_only) return undefined;

                // Determine direction: if not given, default to 'right' when degrees is present
                const effectiveDirection = direction ?? direction_only ?? 'forward';
                const effectiveUnit = unit?.toLowerCase() ?? 'mm';

                if (
                    ['mm', 'cm', 'centi'].find((item) => effectiveUnit.startsWith(item))
                ) {
                    // distance move
                    const effectiveUnit = unit ?? 'mm';
                    const multiplier = effectiveUnit.startsWith('c') ? 10 : 1;
                    const effectiveValue = value ?? '100';
                    const distance = parseInt(effectiveValue) * multiplier;
                    const dist = ['előre', 'forward'].includes(effectiveDirection)
                        ? distance
                        : -distance;
                    return `bot.straight(${dist})`;
                } else if (
                    ['s', 'mp', 'másodperc'].find((item) =>
                        effectiveUnit.startsWith(item),
                    )
                ) {
                    // time move
                    const timeMs = parseInt(value) * 1000;
                    const speed = ['back', 'backward', 'hátra'].includes(
                        effectiveDirection,
                    )
                        ? -200
                        : 200;
                    return `bot.drive(${speed}, 0)\nwait(${timeMs})\nbot.stop()`;
                }
            },
        },

        // Turn left or right with optional degrees (default 90)
        {
            // Matches:
            // "turn 90", "turn left", "turn left 90", "turn 90 degrees", "left 90", "left", "right 45", "rotate right 180"
            // Only matches if at least verb or direction is present
            pattern:
                /^(?:(?<action>turn|rotate|fordulj)(?:\s+(?<dir1>left|right|balra|jobbra))?|\b(?<dir2>left|right|balra|jobbra))\s*(?<value>\d+)?\s*(?<unit>degrees?|deg|d|fok(ot)?)?/i,
            template: (match) => {
                const { action, dir1, dir2, value, unit } = match.groups!;

                // Determine direction: prefer dir1 (from "turn left"), else dir2 (from "left 90")
                let direction = dir1 || dir2;
                if (!action && !direction) return undefined;

                // Determine direction: if not given, default to 'right' when degrees is present
                // If no degrees but direction is present, default degrees to 90
                const effectiveDirection = direction ?? 'right';
                const effectiveAmount = value
                    ? parseInt(value)
                    : effectiveDirection
                    ? 90
                    : 0;

                // If no direction and no degrees, command is unrecognized, return fallback
                if (effectiveDirection && !!effectiveAmount) {
                    // Calculate angle: left = negative degrees, right = positive
                    const angle = ['left', 'balra'].includes(effectiveDirection)
                        ? -effectiveAmount
                        : effectiveAmount;

                    return `bot.turn(${angle})`;
                }
            },
        },

        // Ignore leading commas or 'then'
        {
            pattern: /^(,|then|and|és|majd|aztán)/i,
            template: () => '',
        },

        // Stop movement
        {
            pattern: /^(stop|halt|állj)/i,
            template: () => 'bot.stop()',
        },
    ];

    const results = [] as string[];
    while (line.length > 0 && line[0] !== '#') {
        let found = false;
        for (const { pattern, template } of patterns) {
            const match = line.match(pattern);
            // If the pattern matches, apply
            if (match) {
                const result = template(match);

                const remainingText =
                    match[0].length < line.length
                        ? line.slice(match[0].length).trim()
                        : '';
                line = remainingText;

                if (result?.length) {
                    results.push(result || '');
                }
                found = true;
                break;
            }
        }
        if (!found) {
            results.push('# Sorry, command not recognized');
            break;
        }
    }

    return results;
}
