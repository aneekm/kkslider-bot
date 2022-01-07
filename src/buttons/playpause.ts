import { AudioPlayerStatus } from "@discordjs/voice";
import { Client, ButtonInteraction } from "discord.js";
import { BotContext, Button } from "../types";
import { getProperName } from "../util";

export const playpause: Button = new Button({
    name: 'playpause',
    run: handler
});

async function handler(client: Client, context: BotContext, interaction: ButtonInteraction): Promise<void> {
    const guildId: string = interaction.guild?.id as string;
    const requesterName: string = getProperName(interaction);
    const serverQueue = context.musicQueues.get(guildId);

    if (!serverQueue) {
        await interaction.reply({
            content: `I'm not playing anything right now, ${requesterName}`,
            ephemeral: true
        });
        return;
    }

    try {
        const audioPlayer = serverQueue.audioPlayer;
        if (audioPlayer?.state.status === AudioPlayerStatus.Playing) {
            audioPlayer.pause();
            await interaction.reply({
                content: 'Paused the music.',
                ephemeral: true
            });
        } else if (audioPlayer?.state.status === AudioPlayerStatus.Paused) {
            audioPlayer.unpause();
            await interaction.reply({
                content: 'Those industry fat cats try to put a price on my music, ' +
                         'but it wants to be free.',
                ephemeral: true
            });
        }
    } catch (error) {
        serverQueue.songs = [];
        console.log(error);
    }
}