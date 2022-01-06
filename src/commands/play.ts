import { SlashCommandBuilder } from "@discordjs/builders";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    StreamType,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus
} from "@discordjs/voice";
import {
    Client,
    CommandInteraction,
    Guild,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
    VoiceChannel
} from "discord.js";
import { promisify } from "util";
import { BotContext, Command, IServerMusicQueue, ISong } from "../types";
import { createColouredEmbed, formatDuration, getFormattedLink } from "../util";

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const wait = promisify(setTimeout);

const playCommand: any =
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Request something!')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song you want K.K. to play, name or URL')
                .setRequired(true));

const handler = async (client: Client, context: BotContext, interaction: CommandInteraction) => {
    const voiceChannel = (interaction.member as GuildMember).voice.channel;

    if (!voiceChannel) {
        await interaction.reply({
            content: 'You must be in a voice channel to request something.',
            ephemeral: true
        });
        return;
    }

    await interaction.deferReply();

    const interactionMember: GuildMember = interaction.member as GuildMember;
    const playEmbed = await handlePlay(
        client,
        context,
        interaction.channel as TextChannel,
        interactionMember.voice.channel as VoiceChannel,
        interaction.guild as Guild,
        interactionMember,
        [interaction.options.getString("song", true)]
    );

    interaction.editReply({ embeds: [playEmbed] });
}

export const play: Command = new Command({
    slashCommand: playCommand,
    run: handler
});

// Main handler for playing a song over VC
async function handlePlay(
    client: Client,
    context: BotContext,
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
    args: string[]
): Promise<MessageEmbed> {

    // Get the song info
    let songInfo = null;
    try {
        songInfo = await getSongInfo(args);
    } catch (error) {
        return createColouredEmbed(client.user?.displayAvatarURL(), error as string);
    }
    if (songInfo === null) {
        return createColouredEmbed(client.user?.displayAvatarURL(), "Could not find the song");
    }

    // Create the song object
    const duration = parseInt(songInfo.videoDetails.lengthSeconds);
    const song: ISong = {
        info: songInfo,
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: duration,
        formattedDuration: formatDuration(duration),
        member: member,
    };

    // Add the new song to the queue
    const serverQueue = addSongToQueue(
        context,
        song,
        guild,
        voiceChannel,
        textChannel
    );

    // If a new queue was created then we immediately play the song
    if (!serverQueue.isPlaying) {
        playSong(guild.id, context.musicQueues, context.timeoutDuration, client.user?.displayAvatarURL() as string);
    }

    return createColouredEmbed(
        member.displayAvatarURL(),
        'Queued up',
        `${getFormattedLink(song)} (${song.formattedDuration})`
    );
}

/**
 * Read the user's request and get the song from youtube
 *
 * @param args the arguments of the user
 * @returns the song info of their desired song
 */
async function getSongInfo(args: string[]): Promise<any> {
    let songInfo = null;
    let songUrl = args[0];

    // Search for the song if the url is invalid
    // This part tends to break often, hence lots of try catch
    if (!ytdl.validateURL(songUrl)) {
        // Combine args
        let searchString = null;
        try {
            searchString = await ytsr.getFilters(args.join(" "));
        } catch (error) {
            console.log(error);
            throw "Error parsing arguments";
        }

        // Try to find video
        const videoSearch = searchString.get("Type").get("Video");
        try {
            const results: any = await ytsr(videoSearch.url, {
                limit: 1,
            });
            console.log(results);
            songUrl = results.items[0].url;
        } catch (error) {
            console.log(error);
            throw "Error searching for the song";
        }

        // Check that song URL is valid
        if (!ytdl.validateURL(songUrl)) {
            throw "Could not find the song";
        }
    }

    try {
        // Find the song details from URL
        songInfo = await ytdl.getInfo(songUrl);
    } catch (error) {
        console.log(error);
        throw "Error getting the video from the URL";
    }

    return songInfo;
}

function addSongToQueue(
    context: BotContext,
    song: ISong,
    guild: Guild,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel
): IServerMusicQueue {

    let musicQueue = context.musicQueues.get(guild.id);
    if (!musicQueue) {
        musicQueue = {
            voiceChannel: voiceChannel,
            textChannel: textChannel,
            songs: [],
            isPlaying: false,
            isRepeating: false,
        };
        context.musicQueues.set(guild.id, musicQueue);
    }

    musicQueue.songs.push(song);
    return musicQueue;
}

async function getSongPlayer(song: ISong): Promise<AudioPlayer> {
    const player = createAudioPlayer();
    const stream = ytdl(song.url, {
        filter: "audioonly",
        //highWaterMark: 1 << 25, // Set buffer size
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
    });

    player.play(resource);
    return entersState(player, AudioPlayerStatus.Playing, 5_000);
}

async function connectToChannel(channel: VoiceChannel): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        connection.on("stateChange", async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason
                    === VoiceConnectionDisconnectReason.WebSocketClose
                    && newState.closeCode === 4014) {
                    /**
                     * If the websocket closed with a 4014 code, this means that we
                     * should not manually attempt to reconnect but there is a chance
                     * the connection will recover itself if the reason of disconnect
                     * was due to switching voice channels. This is also the same code
                     * for being kicked from the voice channel so we allow 5 s to figure
                     * out which scenario it is. If the bot has been kicked, we should
                     * destroy the voice connection
                     */
                    try {
                        await entersState(
                            connection,
                            VoiceConnectionStatus.Connecting,
                            5_000
                        );
                        // Probably moved voice channel
                    } catch {
                        connection.destroy();
                        // Probably removed from voice channel
                    }
                } else if (connection.rejoinAttempts < 5) {
                    // The disconnect is recoverable, and we have < 5 attempts so we
                    // will reconnect
                    await wait((connection.rejoinAttempts + 1) * 5_000);
                    connection.rejoin();
                } else {
                    // The disconnect is recoverable, but we have no more attempts
                    connection.destroy();
                }
            }
        });
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

async function playSong(
    guildId: string,
    musicQueue: Map<string, IServerMusicQueue>,
    timeout: number,
    botDisplayAvatarURL: string,
): Promise<void> {

    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue) {
        return;
    }

    if (serverQueue.songs.length === 0) {
        return handleEmptyQueue(
            guildId,
            musicQueue,
            serverQueue,
            timeout,
            botDisplayAvatarURL
        );
    }

    const song = serverQueue.songs[0];
    const connection = await connectToChannel(serverQueue.voiceChannel);
    serverQueue.audioPlayer = await getSongPlayer(song);
    connection.subscribe(serverQueue.audioPlayer as AudioPlayer);
    serverQueue.isPlaying = true;

    serverQueue.audioPlayer?.on(AudioPlayerStatus.Idle, () => {
        serverQueue.isPlaying = false;
        handleSongFinish(guildId, musicQueue, serverQueue, timeout, botDisplayAvatarURL);
    });

    // Send to channel which song we are playing
    sendPlayingEmbed(serverQueue, botDisplayAvatarURL);
}

function handleSongFinish(
    guildId: string,
    musicQueue: Map<string, IServerMusicQueue>,
    serverQueue: IServerMusicQueue,
    timeout: number,
    botDisplayAvatarURL: string) {

    if (serverQueue !== null) {
        const song = serverQueue.songs[0];

        if (serverQueue.isRepeating) {
            serverQueue.songs.push(song);
        }

        serverQueue.songs.shift();
        playSong(guildId, musicQueue, timeout, botDisplayAvatarURL);
    }
}

function handleEmptyQueue(
    guildId: string,
    musicQueue: Map<string, IServerMusicQueue>,
    serverQueue: IServerMusicQueue,
    timeoutDuration: number,
    botDisplayAvatarURL: string) {

    const connection = getVoiceConnection(guildId) as VoiceConnection;

    if (serverQueue.voiceChannel.members.size === 0) {
        // If there are no more members
        connection.destroy();
        musicQueue.delete(guildId);

        createAndSendEmbed(serverQueue.textChannel, botDisplayAvatarURL,
            "Stopping music as all members have left the voice channel");
    }

    // if there is no new songs after timeout, leave VC
    setTimeout(() => {
        if (serverQueue.songs.length === 0) {
            serverQueue.playingMessage?.delete();
            connection.destroy();
            musicQueue.delete(guildId);
            return;
        }
    }, timeoutDuration);
}

function createActionRow() {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('playpause')
                .setLabel('Play/Pause')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle('DANGER')
        );
}

function sendPlayingEmbed(serverQueue: IServerMusicQueue, authorAvatarUrl: string) {
    const song = serverQueue.songs[0];
    const songLink = getFormattedLink(song);
    const embed: MessageEmbed = createColouredEmbed(
        authorAvatarUrl,
        'Now Playing',
        `Right on. I'm tuned up and ready to roll. This one's called ${songLink}. (${song.formattedDuration})`
    );
    const actionRow: MessageActionRow = createActionRow();

    serverQueue.textChannel.send({
        embeds: [embed],
        components: [actionRow]
    }).then((message) => {
        if (serverQueue.playingMessage !== null) {
            serverQueue.playingMessage?.delete();
        }
        serverQueue.playingMessage = message;
    });
}

function createAndSendEmbed(
    channel: TextChannel,
    authorAvatarUrl?: string,
    title?: string,
    description?: string): Promise<Message> {
    return channel.send({
        embeds: [createColouredEmbed(authorAvatarUrl, title, description)],
    });
}
