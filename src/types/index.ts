import { AudioPlayer } from "@discordjs/voice";
import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";

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
