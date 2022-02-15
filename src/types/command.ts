import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { BotContext } from ".";

export interface CommandProps {
    readonly shortHelp: string;
    readonly longHelp?: string;
    readonly slashCommand: SlashCommandBuilder;
    readonly run: (client: Client, context: BotContext, interaction: CommandInteraction) => void;
}

export class Command {
    name: string;
    shortHelp: string;
    longHelp?: string;
    command: SlashCommandBuilder;
    run: (client: Client, context: BotContext, interaction: CommandInteraction) => void;

    constructor(props: CommandProps) {
        this.name = props.slashCommand.name;
        this.shortHelp = props.shortHelp;
        this.longHelp = props.longHelp;
        this.command = props.slashCommand;
        this.run = props.run;
    }
}