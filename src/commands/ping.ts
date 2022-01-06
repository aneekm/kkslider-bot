import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext } from "../types";
import { Command } from "../types/command";

export const ping: Command = new Command({
    slashCommand: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Chat with K.K. before the show.'),
    run: async (client: Client, context: BotContext, interaction: CommandInteraction) => {
        const message = `Hey, ${interaction.guild?.name}. It's real groovy being here today.`;

        await interaction.reply(message);
    }
});