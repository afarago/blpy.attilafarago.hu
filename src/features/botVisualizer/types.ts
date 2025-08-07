export type CommandType = 'straight' | 'curve' | 'turn';

export interface Command {
    type: CommandType;
    
    distance?: number; // for straight commands
    angle?: number; // for turn commands
    radius?: number; // for curve commands
}

export type ParsedCommand = Command & {
    id: number; // Unique identifier for each command
};
