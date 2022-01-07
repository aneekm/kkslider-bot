import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext, Command } from "../types";
import { createColouredEmbed } from "../util";
import { inviteLink } from '../config.json';
import { commands } from ".";

const repoLink = 'https://github.com/aneekm/kkslider-bot';

export const help: Command = new Command({
    help: "Get a list of what I can do and how to use them.",
    slashCommand: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Ask K.K. for a helping hand.'),
    run: handler
});

async function handler (client: Client, context: BotContext, interaction: CommandInteraction) {
    let helpEmbed = createColouredEmbed(client.user?.displayAvatarURL(), "Available commands");

    const commandHelpTexts = Array.from(commands.values())
        .sort((a,b) => {
            return a.name.localeCompare(b.name);
        }).map(c => {
            return `**${c.name}**: ${c.help}`;
        });

    helpEmbed.addFields(
        {
            name: bold('Commands'),
            value: commandHelpTexts.join('\n')
        },
        {
            name: bold('Support'),
            value: `Add K.K. Slider to your server: **[Invite](${inviteLink})**\n \
            If slash commands do not appear, reinvite this bot with the link above.\n \
            I'm **[open source](${repoLink})**! Feel free to add an issue or make a PR.`
        }
    );

    await interaction.reply({ embeds: [helpEmbed] });
}