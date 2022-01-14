import { Client, ButtonInteraction } from "discord.js";
import { BotContext, Button } from "../types";
import { getProperName } from "../util";

export const shuffle: Button = new Button({
    name: 'shuffle',
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
        serverQueue.songs = shuffleArray(serverQueue.songs);
        await interaction.reply({
            content: `Shuffled the tracklist, ${requesterName}.`,
            ephemeral: true
        });
    } catch (error) {
        serverQueue.songs = [];
        console.log(error);
    }
}

// Implements the Fisher-Yates shuffling algorithm on array from indices 1:end
function shuffleArray<T>(a: T[]): T[] {
    const n: number = a.length;
    for (let i = n - 1; i > 1; i--) {
        const j: number = Math.floor(Math.random() * (i) + 1);
        [a[j], a[i]] = [a[i], a[j]];
    }
    return a;
}