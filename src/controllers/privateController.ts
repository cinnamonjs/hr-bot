import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CacheType,
	ChannelType,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedUtils } from "../utils/embedBuilder";
import { Logger } from "../utils/logger";

// Store active private channels
const privateChannels = new Map();

export const data = new SlashCommandBuilder()
	.setName("private")
	.setDescription("Create a private channel with a user")
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("The user to create a private channel with")
			.setRequired(true),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	await interaction.deferReply({ ephemeral: true });

	try {
		const targetUser = interaction.options.getUser("user");
		const guild = interaction.guild;

		if (!targetUser) {
			Logger.info("unable to find target user");
			return;
		}
		if (!guild) {
			Logger.info("guild is not longer available cause missing id");
			return;
		}
		Logger.info(
			`User ${interaction.user.tag} requested a private channel with ${targetUser.tag}`,
		);

		if (privateChannels.has(targetUser.id)) {
			const existingChannel = privateChannels.get(targetUser.id);
			const errorEmbed = EmbedUtils.createErrorEmbed(
				"Private Channel Already Exists",
				`There is already an active private channel with <@${targetUser.id}>. Please use </close:0> to close it first.`,
			);

			await interaction.editReply({ embeds: [errorEmbed] });
			return;
		}

		const channel = await guild.channels.create({
			name: `private-${targetUser.username}`,
			type: ChannelType.GuildText,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				},
				{
					id: targetUser.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				},
			],
		});

		privateChannels.set(targetUser.id, {
			channelId: channel.id,
			createdBy: interaction.user.id,
			createdAt: new Date(),
		});

		const notificationEmbed = EmbedUtils.createPrivateChannelEmbed(
			targetUser.id,
			channel.id,
		);

		const closeButton = new ButtonBuilder()
			.setCustomId(`close_${channel.id}`)
			.setLabel("Close Channel")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			closeButton,
		);

		await channel.send({
			content: `Private channel created by <@${interaction.user.id}> for <@${targetUser.id}>`,
			embeds: [notificationEmbed],
			components: [row],
		});

		const successEmbed = EmbedUtils.createSuccessEmbed(
			"Private Channel Created",
			`A private channel has been created with <@${targetUser.id}>. [Click here to join](https://discord.com/channels/${guild.id}/${channel.id})`,
		);

		await interaction.editReply({ embeds: [successEmbed] });
	} catch (error) {
		Logger.error("Error executing /private command", error);
		const errorEmbed = EmbedUtils.createErrorEmbed(
			"Error",
			"An unexpected error occurred",
		);
		await interaction.editReply({ embeds: [errorEmbed] });
	}
}

export async function handleCloseCommand(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	const channelToClose = interaction.channelId;
	let found = false;

	for (const [userId, channelData] of privateChannels.entries()) {
		if (channelData.channelId === channelToClose) {
			found = true;

			await interaction.channel?.delete();

			privateChannels.delete(userId);

			Logger.info(
				`Private channel with user ${userId} closed by ${interaction.user.tag}`,
			);
			break;
		}
	}

	if (!found) {
		await interaction.reply({
			embeds: [
				EmbedUtils.createErrorEmbed(
					"Error",
					"This is not a private channel that can be closed.",
				),
			],
			ephemeral: true,
		});
	}
}

export async function handleCloseButton(
	interaction: ButtonInteraction<CacheType>,
) {
	const channelId = interaction.customId.split("_")[1];

	let found = false;

	for (const [userId, channelData] of privateChannels.entries()) {
		if (channelData.channelId === channelId) {
			found = true;

			await interaction.channel?.delete();

			privateChannels.delete(userId);

			Logger.info(
				`Private channel with user ${userId} closed by ${interaction.user.tag} via button`,
			);
			break;
		}
	}

	if (!found) {
		await interaction.reply({
			embeds: [
				EmbedUtils.createErrorEmbed(
					"Error",
					"Unable to find this channel in active private channels.",
				),
			],
			ephemeral: true,
		});
	}
}
