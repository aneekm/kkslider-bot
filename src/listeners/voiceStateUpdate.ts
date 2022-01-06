import { getVoiceConnection } from "@discordjs/voice";
import { Client, VoiceChannel, VoiceState } from "discord.js";
import { BotContext } from "../types";

export default (client: Client, context: BotContext): void => {
    client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
        const guildId = oldState.guild.id;

        const serverQueue = context.musicQueues.get(guildId);
        // don't care about updates if nothing's playing
        if (!serverQueue) {
            return;
        }

        if (oldState.member?.id === client.user?.id) {
            if (newState.channel !== null) {
                // moved to new channel
                serverQueue.voiceChannel = newState.channel as VoiceChannel;
            } else {
                // disconnected/kicked from VC
                context.musicQueues.delete(guildId);
            }
        } else if (serverQueue.voiceChannel.members.size === 1) {
            setTimeout(() => {
                const serverQueue = context.musicQueues.get(guildId);
                if (serverQueue !== null && serverQueue?.voiceChannel.members.size === 1) {
                  const connection = getVoiceConnection(guildId);
                  connection?.destroy();
                  serverQueue.songs = [];
                }
            }, context.timeoutDuration)
        }
    });
};
