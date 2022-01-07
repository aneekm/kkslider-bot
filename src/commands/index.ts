import { Command } from "../types";
import { help } from "./help";
import { ping } from "./ping";
import { play } from "./play";

export const commands: Map<string, Command> = new Map(
    // Add new commands here
    [help, ping, play]
        .map(command => [command.name, command])
);
