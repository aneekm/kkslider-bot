import { Client, Intents } from 'discord.js';
import { token } from './config.json';
import commandInteraction from './listeners/commandInteraction';
import ready from './listeners/ready';
import voiceStateUpdate from './listeners/voiceStateUpdate';
import { BotContext } from './types';

// Create new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
});

// Create new Context
let context: BotContext = new BotContext({
    timeoutDuration: 30000 // set timeout to 30s
});

// When client is ready, run this code (only once)
ready(client);

// Listen and respond to slash command interactions with the bot
commandInteraction(client, context);

// Listen and respond to voice state updates with the bot
voiceStateUpdate(client, context);

// Login to Discord with bot's client token
client.login(token);
