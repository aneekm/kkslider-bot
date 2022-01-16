import { AudioPlayer } from "@discordjs/voice";
import {
    GuildMember,
    Message,
    Snowflake,
    TextChannel,
    VoiceChannel
} from "discord.js";

export * from './button';
export * from './command';
export * from './context';

/**
 * Contains all the data for each song in the play song command
 */
export interface ISong {
    info: any;
    title: string;
    url: string;
    duration: number;
    formattedDuration: string;
    member: GuildMember;
}
  
/**
 * Contains data for the music queue of a server
 */
export interface IServerMusicQueue {
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    songs: ISong[];
    audioPlayer?: AudioPlayer;
    playingMessage?: Message;
    isPlaying: boolean;
    isRepeating: boolean;
}

/**
 * Contains data for a reaction role in a server
 */
export interface IReactionRole {
    id: Snowflake;
    name: string;
    description?: string;
    emoji: string;
}

/**
 * Contains data for the reaction role manager for a server
 */
export interface IServerRoleManager {
    roles: IReactionRole[];
    textChannel: TextChannel;
    roleMessage?: Message;
}
