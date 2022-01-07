import { getVoiceConnection } from "@discordjs/voice";
import { Client, VoiceChannel, VoiceState } from "discord.js";
import { BotContext } from "../types";
import { createColouredEmbed } from "../util";

export default (client: Client, context: BotContext): void => {
    client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
        const guildId = oldState.guild.id;

        const serverQueue = context.musicQueues.get(guildId);
        // don't care about updates if nothing's playing
        if (!serverQueue) {
            return;
        }

        if (oldState.member?.id === client.user?.id) {
            // the bot's channel changed
            if (newState.channel !== null) {
                // moved to new channel
                serverQueue.voiceChannel = newState.channel as VoiceChannel;
            } else {
                // disconnected/kicked from VC
                await serverQueue.playingMessage?.delete();
                context.musicQueues.delete(guildId);
            }
        } else if (serverQueue.voiceChannel.members.size === 1) {
            // bot's only one left in the channel
            setTimeout(async () => {
                const serverQueue = context.musicQueues.get(guildId);
                if (serverQueue !== null && serverQueue?.voiceChannel.members.size === 1) {
                    const connection = getVoiceConnection(guildId);
                    connection?.destroy();
                    serverQueue.songs = [];
                    await serverQueue.textChannel.send({
                        embeds: [createColouredEmbed(
                            client.user?.displayAvatarURL(),
                            'Show has Ended',
                            'Sometimes, you just gotta sit in the yard and not be anything ' + 
                            'for a while. Just be you. Thanks for listening.'
                            )]
                    });
                }
            }, context.timeoutDuration)
        }
    });
};
