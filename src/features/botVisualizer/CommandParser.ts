import { Command } from './types';

export function parseCommands(pycode: string[]): Command[] {
    const commands: Command[] = [];
    let commandDriveState = { active: false, speed: 0, wait: 0 };

    for (const line of pycode) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const driveMatch = /^(?!#).*?\.drive\(([-]?\d+).*\)/.exec(trimmedLine);
        if (driveMatch) {
            commandDriveState.speed = parseInt(driveMatch[1], 10);
            commandDriveState.active = true;
            commandDriveState.wait = 0;
            continue;
        }

        const waitMatch = /^(?!#).*?wait\(([-]?\d+).*\)/.exec(trimmedLine);
        if (waitMatch) {
            commandDriveState.wait += parseInt(waitMatch[1], 10) / 1000.0;
            continue;
        }

        const stopMatch = /^(?!#).*?\.stop\(\)/.exec(trimmedLine);
        if (stopMatch) {
            if (commandDriveState.active) {
                commands.push({
                    type: 'straight',
                    distance: commandDriveState.speed * commandDriveState.wait,
                });
            }
            commandDriveState.active = false;
            continue;
        }

        const straightMatch = /^(?!#).*?\.straight\(([-]?\d+).*\)/.exec(trimmedLine);
        if (straightMatch) {
            commands.push({
                type: 'straight',
                distance: parseInt(straightMatch[1], 10),
            });
            continue;
        }

        const curveMatch = /^(?!#).*?\.curve\(([-]?\d+),\s*([-]?\d+).*\)/.exec(
            trimmedLine,
        );
        if (curveMatch) {
            commands.push({
                type: 'curve',
                radius: parseInt(curveMatch[1], 10),
                angle: parseInt(curveMatch[2], 10),
            });
            continue;
        }

        const arcMatch =
            /^(?!#).*?\.arc\(\s*([-]?\d+)\s*,\s*angle\s*=\s*([-]?\d+)\s*\)/.exec(
                trimmedLine,
            );
        if (arcMatch) {
            commands.push({
                type: 'curve',
                radius: parseInt(arcMatch[1], 10),
                angle: parseInt(arcMatch[2], 10),
            });
            continue;
        }

        const turnMatch = /^(?!#).*?\.turn\(([-]?\d+).*\)/.exec(trimmedLine);
        if (turnMatch) {
            commands.push({ type: 'turn', angle: parseInt(turnMatch[1], 10) });
            continue;
        }

        // If no match, you can handle unrecognized commands here if needed
    }

    return commands;
}
