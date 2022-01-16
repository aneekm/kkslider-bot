import { IServerMusicQueue, IServerRoleManager } from ".";

export interface BotContextProps {
    readonly musicQueues?: Map<string, IServerMusicQueue>;
    readonly roleManagers?: Map<string, IServerRoleManager>;
    readonly timeoutDuration?: number;
}

/**
 * Contains the necessary state for the bot with sane defaults
 */
 export class BotContext {
    public musicQueues: Map<string, IServerMusicQueue>;
    public roleManagers: Map<string, IServerRoleManager>;
    public timeoutDuration: number;

    constructor(props: BotContextProps) {
        this.musicQueues = props.musicQueues ?? new Map();
        this.roleManagers = props.roleManagers ?? new Map();
        this.timeoutDuration = props.timeoutDuration ?? 60000; // 60 seconds
    };
}