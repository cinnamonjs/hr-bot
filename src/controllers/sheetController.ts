import {
	type CacheType,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { GoogleService } from "../services/googleService";
import { EmbedUtils } from "../utils/embedBuilder";
import { Logger } from "../utils/logger";

const googleService = new GoogleService();

export const data = new SlashCommandBuilder()
	.setName("sheet")
	.setDescription("Create a new Google Sheet")
	.addStringOption((option) =>
		option
			.setName("title")
			.setDescription("Title of the Google Sheet")
			.setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	await interaction.deferReply();

	try {
		const title =
			interaction.options.getString("title") ||
			`HR Sheet - ${new Date().toLocaleDateString()}`;
		Logger.info(
			`User ${interaction.user.tag} requested a new Google Sheet with title: ${title}`,
		);

		const result = await googleService.createSheet(title);

		if (result.success && result.data?.link) {
			const embed = EmbedUtils.createSheetEmbed(title, result.data?.link);
			const linkButton = EmbedUtils.createLinkButton(
				"Open Sheet",
				result.data?.link,
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
		Logger.error("Error executing /sheet command", error);
		const errorEmbed = EmbedUtils.createErrorEmbed(
			"Error",
			"An unexpected error occurred",
		);
		await interaction.editReply({ embeds: [errorEmbed] });
	}
}
