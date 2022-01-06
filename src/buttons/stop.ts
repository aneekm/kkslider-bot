import { getVoiceConnection } from "@discordjs/voice";
import { ButtonInteraction, Client, Message, MessageEmbed } from "discord.js";
import { Button, BotContext } from "../types";
import { createColouredEmbed, getProperName } from "../util";

export const stop: Button = new Button({
    name: 'stop',
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

    serverQueue.songs = [];
    const connection = getVoiceConnection(guildId);
    connection?.destroy();

    const embed: MessageEmbed = createColouredEmbed(client.user?.displayAvatarURL(), "Disconnected",
        `That was groovy, ${requesterName}. Maybe I'll catch you next time.`);
    
    await (interaction.message as Message).delete();
    await interaction.channel?.send({
        embeds: [embed]
    });
}