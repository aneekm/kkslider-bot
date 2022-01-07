import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayerStatus, AudioPlayerPlayingState } from "@discordjs/voice";
import { Client, CommandInteraction, Guild, MessageEmbed } from "discord.js";
import { BotContext, Command } from "../types";
import { createColouredEmbed, formatDuration, getFormattedLink } from "../util";

export const tracklist: Command = new Command({
    help: 'See up to 10 of the upcoming songs queued up.',
    slashCommand: new SlashCommandBuilder()
        .setName('tracklist')
        .setDescription('Get K.K.\'s tracklist!'),
    run: handler
});

async function handler(client: Client, context: BotContext, interaction: CommandInteraction) {
    const serverQueue = context.musicQueues.get(interaction.guildId as string);
    if (!serverQueue || serverQueue.songs.length === 0) {
        await interaction.reply({
            embeds: [createColouredEmbed(
                client.user?.displayAvatarURL(),
                'I\'m not playing anything right now!'
            )],
            ephemeral: true
        });
        return;
    }

    await interaction.deferReply();

    const currSong = serverQueue.songs[0];
    const songs = serverQueue.songs.slice(1);

    // get current song timestamp
    let currStreamTime = 0;
    const audioPlayerState = serverQueue.audioPlayer?.state;
    if (audioPlayerState?.status === AudioPlayerStatus.Playing) {
        currStreamTime = audioPlayerState.playbackDuration / 1000;
    }
    const currTimestamp = `${formatDuration(currStreamTime)}/${currSong.formattedDuration}`

    // get song details for queue (up to 10)
    const songsInQueue = songs.filter((s, i) => {
        return i < 10;
    }).map((s, i) => {
        return `${i + 1}: ${getFormattedLink(s)} (${formatDuration(s.duration)})`
    }).join('\n');

    const tracklistEmbed = createColouredEmbed(
        client.user?.displayAvatarURL(),
        `Tracklist (${songs.length + 1} songs)`,
    );
    tracklistEmbed.addField('Now Playing', `${getFormattedLink(currSong)} (${currTimestamp})`);
    tracklistEmbed.addField('Coming Up', songsInQueue);

    await interaction.editReply({
        embeds: [tracklistEmbed]
    });
}