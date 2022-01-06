import {
    ButtonInteraction,
    Client,
    CommandInteraction,
    Interaction,
} from "discord.js";
import { buttons } from "../buttons";
import { commands } from "../commands";
import { BotContext } from "../types";

export default (client: Client, context: BotContext): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, context, interaction);
        } else if (interaction.isButton()) {
            await handleButtonCommand(client, context, interaction);
        }
    });
};

const handleSlashCommand = async (
    client: Client, 
    context: BotContext, 
    interaction: CommandInteraction): Promise<void> => {
        
    // handle slash command here
    const command = commands.get(interaction.commandName);

    // if we don't recognize the command, send ephemeral error
	if (!command) {
        await interaction.reply({
            content: 'I don\'t think I\'ve heard that one before.',
            ephemeral: true
        });
        return;
    }

    // run the command, send ephemeral error if needed
    try {
        command.run(client, context, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'I need a little more practice with this one!', ephemeral: true });
    }
};

const handleButtonCommand = async (
    client: Client,
    context: BotContext,
    interaction: ButtonInteraction): Promise<void> => {

    // handle button command here
    const button = buttons.get(interaction.customId);

    // if we don't recognize the button, send ephemeral error
    if (!button) {
        await interaction.reply({
            content: 'I need a little more practice with this one!',
            ephemeral: true
        });
        return;
    }

    try {
        button.run(client, context, interaction);
    } catch (error) {
        console.error(error);
    }
};