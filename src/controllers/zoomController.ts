import {
	type CacheType,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { ZoomService } from "../services/zoomService";
import { EmbedUtils } from "../utils/embedBuilder";
import { Logger } from "../utils/logger";

const zoomService = new ZoomService();

export const data = new SlashCommandBuilder()
	.setName("zoom")
	.setDescription("Create a new Zoom meeting")
	.addStringOption((option) =>
		option
			.setName("topic")
			.setDescription("Topic of the Zoom meeting")
			.setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	await interaction.deferReply();

	try {
		const topic =
			interaction.options.getString("topic") ||
			`HR Meeting - ${new Date().toLocaleDateString()}`;
		Logger.info(
			`User ${interaction.user.tag} requested a new Zoom meeting with topic: ${topic}`,
		);

		const result = await zoomService.createMeeting(topic);

		if (result.success && result.data) {
			const embed = EmbedUtils.createZoomEmbed(result.data);
			const linkButton = EmbedUtils.createLinkButton(
				"Join Meeting",
				result.data.join_url,
			);

			await interaction.editReply({
				embeds: [embed],
				components: [linkButton],
			});
		} else {
			const errorEmbed = EmbedUtils.createErrorEmbed("Error", result.message);
			await interaction.editReply({ embeds: [errorEmbed] });
		}
	} catch (error) {
		Logger.error("Error executing /zoom command", error);
		const errorEmbed = EmbedUtils.createErrorEmbed(
			"Error",
			"An unexpected error occurred",
		);
		await interaction.editReply({ embeds: [errorEmbed] });
	}
}
