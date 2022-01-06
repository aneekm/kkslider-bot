import { ButtonInteraction, Client } from "discord.js";
import { BotContext } from ".";

export interface ButtonProps {
    readonly name: string;
    readonly run: (client: Client, context: BotContext, interaction: ButtonInteraction) => void;
}

export class Button {
    name: string;
    run: (client: Client, context: BotContext, interaction: ButtonInteraction) => void;

    constructor(props: ButtonProps) {
        this.name = props.name;
        this.run = props.run;
    }
}