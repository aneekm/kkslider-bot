import { ButtonInteraction, Client, Interaction } from "discord.js";
import { BotContext, Button } from "../types";
import { createColouredEmbed, getProperName } from "../util";

export const skip: Button = new Button({
    name: 'skip',
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
        // Calling .stop() on AudioPlayer causes transition into the Idle state.
        // Because of a state transition listener defined in Play.ts
        // transitions into the Idle state mean the next song is played
        serverQueue.audioPlayer?.stop();
    } catch (error) {
        serverQueue.songs = [];
        console.log(error);
    }
}