import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext } from ".";

export interface CommandProps {
    readonly help: string;
    readonly slashCommand: SlashCommandBuilder;
    readonly run: (client: Client, context: BotContext, interaction: CommandInteraction) => void;
}

export class Command {
    name: string;
    help: string;
    command: SlashCommandBuilder;
    run: (client: Client, context: BotContext, interaction: CommandInteraction) => void;

    constructor(props: CommandProps) {
        this.name = props.slashCommand.name;
        this.help = props.help;
        this.command = props.slashCommand;
        this.run = props.run;
    }
}