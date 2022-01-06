import { GuildMember, Interaction, MessageEmbed } from "discord.js";
import { ISong } from "./types";

export function getProperName(interaction:  Interaction): string {
    return (interaction.member as GuildMember).nickname ?? interaction.user.username;
}

export function createColouredEmbed(authorAvatarUrl?: string, title?: string, description?: string): MessageEmbed {
    // if we have a title, pre-pend dividing chars
    const adjustedTitle = title === undefined ?
        title :
        '|  ' + title;

    return new MessageEmbed({
        color: "#ffffff",
        author: {
            name: adjustedTitle,
            iconURL: authorAvatarUrl
        },
        description: description
    });
}

export function formatDuration(seconds: number): string {
    if (seconds === 0) {
        return "livestream";
    } else if (seconds < 3600) {
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    } else {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    }
}

export function getFormattedLink(song: ISong): string {
    return `[${song.title}](${song.url})`;
}