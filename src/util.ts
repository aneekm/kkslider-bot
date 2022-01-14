import {
    GuildMember,
    Interaction,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from "discord.js";
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

export function createActionRow(isRepeating: boolean) {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('playpause')
                .setLabel('Play/Pause')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('shuffle')
                .setLabel('Shuffle')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('repeat')
                .setLabel(isRepeating ? 'Repeat: ✅' : 'Repeat: ❎')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle('DANGER')
        );
}