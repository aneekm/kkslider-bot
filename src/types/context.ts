import { IServerMusicQueue } from ".";

export interface BotContextProps {
    readonly musicQueues?: Map<string, IServerMusicQueue>;
    readonly timeoutDuration?: number;
}

/**
 * Contains the necessary state for the bot with sane defaults
 */
 export class BotContext {
    public musicQueues: Map<string, IServerMusicQueue>;
    public timeoutDuration: number;

    constructor(props: BotContextProps) {
        this.musicQueues = props.musicQueues ?? new Map();
        this.timeoutDuration = props.timeoutDuration ?? 60000; // 60 seconds
    };
}