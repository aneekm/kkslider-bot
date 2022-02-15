import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext, Command } from "../types";
import { createColouredEmbed, getProperName } from "../util";
import { inviteLink } from '../config.json';
import { commands } from ".";

const repoLink = 'https://github.com/aneekm/kkslider-bot';

const helpCommand: any =
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Ask K.K. for a helping hand.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want K.K.\'s help with.')
                .setRequired(false));

export const help: Command = new Command({
    shortHelp: "See a summary of what I can do or details about a specific command.",
    slashCommand: helpCommand,
    run: handler
});

async function handler (client: Client, context: BotContext, interaction: CommandInteraction) {
    const commandName = interaction.options.getString('command');
    if (commandName) {
        sendCommandHelpMessage(commandName, client, interaction);
        return;
    }

    sendGeneralHelpMessage(client, interaction);
}

async function sendGeneralHelpMessage(client: Client, interaction: CommandInteraction) {
    let helpEmbed = createColouredEmbed(client.user?.displayAvatarURL(), "Available commands");

    const commandHelpTexts = Array.from(commands.values())
        .sort((a,b) => {
            return a.name.localeCompare(b.name);
        }).map(c => {
            return `**${c.name}**: ${c.shortHelp}`;
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

async function sendCommandHelpMessage(commandName: string, client: Client, interaction: CommandInteraction) {
    if (commands.get(commandName)?.longHelp) {
        await interaction.reply({
            embeds: [
                createColouredEmbed(
                    client.user?.displayAvatarURL(),
                    commandName,
                    commands.get(commandName)?.longHelp)
            ]
        });
    } else {
        await interaction.reply({
            content: `That one's pretty easy, ${getProperName(interaction)}! `
                + 'Just check the help message.',
            ephemeral: true
        });
    }
}