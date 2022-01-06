import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands } from './commands';
import { clientId, guildId, token } from './config.json';

const commandsJson = Array.from(commands.values()).map(c => c.command.toJSON());

const rest = new REST({
    version: '9'
}).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commandsJson
})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);