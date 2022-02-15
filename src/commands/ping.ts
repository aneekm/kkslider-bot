import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext } from "../types";
import { Command } from "../types/command";
import { createColouredEmbed } from "../util";

export const ping: Command = new Command({
    shortHelp: 'Pong!',
    slashCommand: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Chat with K.K. before the show.'),
    run: async (client: Client, context: BotContext, interaction: CommandInteraction) => {
        const ping = Date.now() - interaction.createdTimestamp;

        await interaction.reply({
            embeds: [createColouredEmbed(
                client.user?.displayAvatarURL(),
                "Pong!",
                `Hey, ${interaction.guild?.name}. It's real groovy being here today. (${ping} ms)`
            )]
        });
    }
});