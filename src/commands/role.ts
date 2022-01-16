import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ClientUser, CommandInteraction, Message, MessageActionRow, MessageSelectMenu, Role, TextChannel } from "discord.js";
import { BotContext, Command, IReactionRole } from "../types";
import { createColouredEmbed } from "../util";

const roleCommand: any = new SlashCommandBuilder()
    .setName('role')
    .setDescription('Commands for the server\'s reaction roles')
    .addSubcommand(subcommand =>
        subcommand.setName('add')
            .setDescription('Add an existing role as a reaction role')
            .addRoleOption(option => 
                option.setName('role')
                    .setDescription('The role you want to add as a reaction role')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('emoji')
                    .setDescription('The reaction emoji for this role')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('description')
                    .setDescription('A description of what this role provides access to')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand.setName('reset')
            .setDescription('Reset the reaction roles list using an existing message')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message ID of an existing reaction role message to refill data from')
                    .setRequired(true)));

export const role: Command = new Command({
    help: 'Mark an existing role as a reaction role in this server.',
    slashCommand: roleCommand,
    run: handler
});

async function handler(client: Client, context: BotContext, interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    switch (interaction.options.getSubcommand()) {
        case 'add':
            handleAdd(client, context, interaction);
            break;
        case 'reset':
            handleReset(client, context, interaction);
            break;
        default:
            await interaction.editReply('I don\'t recognize that subcommand');
    }
}

async function handleAdd(client: Client, context: BotContext, interaction: CommandInteraction) {
    const requestedRole: Role = interaction.options.getRole('role', true) as Role;
    const botRole: Role = interaction.guild?.roles.botRoleFor(client.user as ClientUser) as Role;

    if (!checkBotHasControlOverRole(requestedRole, botRole)) {
        await interaction.editReply({
            content: 'I don\'t have priority over that role - please move it ' +
                'below my role in the server role list to add it as a reaction role.'
        });
        return;
    }

    let roleManager = context.roleManagers.get(interaction.guildId as string);

    if (!roleManager) {
        roleManager = {
            roles: [],
            textChannel: interaction.channel as TextChannel
        };
    }

    if (roleManager.roles.find(r => r.id === requestedRole.id)) {
        await interaction.editReply({
            content: 'I\'m already keeping track of that role!'
        });
        return;
    }

    roleManager.roles.push(buildIReactionRole(
        requestedRole,
        interaction.options.getString('emoji', true),
        interaction.options.getString('description')
    ));

    const reactionRoleEmbed = createColouredEmbed(
        client.user?.displayAvatarURL(),
        `Reaction Roles`,
        'React to this message to be assigned the following roles.'
    );

    const roleListings = Array.from(roleManager.roles.map(r => {
        let msg = `${r.emoji} : **${r.name}**`;
        if (r.description) {
            msg += ` - ${r.description}`
        }
        return msg;
    }));

    reactionRoleEmbed.addField('Roles', roleListings.join('\n\n'));

    if (!roleManager.roleMessage) {
        roleManager.roleMessage = await interaction.channel?.send({
            embeds: [reactionRoleEmbed]
        });
    } else {
        try {
            roleManager.roleMessage = await roleManager.roleMessage.edit({
                embeds: [reactionRoleEmbed]
            });
        } catch (err) {
            console.log('Reaction message was deleted: ' + err);
            roleManager.roleMessage = await interaction.channel?.send({
                embeds: [reactionRoleEmbed]
            });
        }
    }

    roleManager.roles.forEach(async r => await roleManager?.roleMessage?.react(r.emoji));

    context.roleManagers.set(interaction.guildId as string, roleManager);

    const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.setMinValues(2)
					.setMaxValues(3)
					.addOptions([
						{
							label: 'Select me',
							description: 'This is a description',
							value: 'first_option',
						},
						{
							label: 'You can select me too',
							description: 'This is also a description',
							value: 'second_option',
						},
						{
							label: 'I am also an option',
							description: 'This is a description as well',
							value: 'third_option',
						},
					]),
			);

    await interaction.editReply({
        content: 'The reaction role was added.',
        components: [row]
    });
}

async function handleReset(client: Client, context: BotContext, interaction: CommandInteraction) {
    const messageId = interaction.options.getString('message', true);
    let roleManager = context.roleManagers.get(interaction.guildId as string);

    if (!roleManager) {
        roleManager = {
            roles: [],
            textChannel: interaction.channel as TextChannel
        };
    }

    try {
        roleManager.roleMessage = await roleManager.textChannel.messages.fetch(messageId);
    } catch (err) {
        console.log('Failed to find old reaction role message in channel');
        console.log(err);
        await interaction.editReply('I couldn\'t find the message in this channel. '
            + 'Did you run the command in the same channel as the message?');
        return;
    }

    try {
        roleManager.roles = parseRolesFromOldMessage(roleManager.roleMessage, interaction);
    } catch (err) {
        console.log('Failed to parse old reaction roles from message');
        console.log(err);
        await interaction.editReply('I couldn\'t parse the roles from the message. '
            + 'Did you send me the right message ID?');
        return;
    }

    context.roleManagers.set(interaction.guildId as string, roleManager);

    await interaction.editReply('Successfully reset the server\'s reaction role manager '
        + 'using the existing message.');
}

function checkBotHasControlOverRole(requestedRole: Role, botRole: Role): boolean {
    return botRole.comparePositionTo(requestedRole) >= 0;
}

function buildIReactionRole(role: Role, emoji: string, description: string | null): IReactionRole {
    return {
        id: role.id,
        name: role.name,
        description: description ?? undefined,
        emoji: emoji
    };
}

function parseRolesFromOldMessage(msg: Message, interaction: CommandInteraction): IReactionRole[] {
    const reactionRoles: IReactionRole[] = [];

    // expects the format of the embed field created on ~ line 94
    msg.embeds[0].fields[0].value.split('\n\n').forEach(roleListing => {
        // parse out message using format on ~ lines 86-91
        const regexMatch = roleListing.match(/(.+) : \*\*(.+)\*\*(?: - (.*))?/u);
        if (!regexMatch) {
            console.log('Failed to parse roleListing: ' + roleListing + '>' +regexMatch);
            return;
        }

        const role = interaction.guild?.roles.cache.find(role => role.name === regexMatch[2]);
        if (!role) {
            console.log('Failed to find role with name: ' + regexMatch[2]);
            return;
        }

        reactionRoles.push({
            id: role.id,
            name: regexMatch[2],
            description: regexMatch[3],
            emoji: regexMatch[1]
        });
    })

    return reactionRoles;
}