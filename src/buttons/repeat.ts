import { Client, ButtonInteraction } from "discord.js";
import { BotContext, Button } from "../types";
import { createActionRow, getProperName } from "../util";

export const repeat: Button = new Button({
    name: 'repeat',
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
        serverQueue.isRepeating = !serverQueue.isRepeating;
        await interaction.update({
            components: [createActionRow(serverQueue.isRepeating)]
        });
    } catch (error) {
        serverQueue.songs = [];
        console.log(error);
    }
}