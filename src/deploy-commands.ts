import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands } from './commands';
import { clientId, guildId, token } from './config.json';

const commandsJson = Array.from(commands.values()).map(c => c.command.toJSON());

const rest = new REST({
    version: '9'
}).setToken(token);

/*
Parse command line args to determine if we want to deploy guild commands, global commands,
or clear out guild commands (used at end of testing to clean up interface in test server).
*/
const option = process.argv[2];
if (!option) {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commandsJson
    })
        .then(() => console.log('Successfully registered guild application commands.'))
        .catch(console.error);
}

if (option === 'global') {
    rest.put(Routes.applicationCommands(clientId), {
        body: commandsJson
    })
        .then(() => console.log('Successfully registered global application commands.'))
        .catch(console.error);
}

if (option === 'clean') {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: []
    })
        .then(() => console.log('Successfully registered no application commands.'))
        .catch(console.error);
}