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
	.setName("docs")
	.setDescription("Create a new Google Doc")
	.addStringOption((option) =>
		option
			.setName("title")
			.setDescription("Title of the Google Doc")
			.setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<CacheType>,
) {
	await interaction.deferReply();

	try {
		const title =
			interaction.options.getString("title") ||
			`HR Document - ${new Date().toLocaleDateString()}`;
		Logger.info(
			`User ${interaction.user.tag} requested a new Google Doc with title: ${title}`,
		);

		const result = await googleService.createDoc(title);

		if (result.success && result.data?.url) {
			const embed = EmbedUtils.createDocsEmbed(title, result.data.url);
			const linkButton = EmbedUtils.createLinkButton(
				"Open Doc",
				result.data.url,
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
		Logger.error("Error executing /docs command", error);
		const errorEmbed = EmbedUtils.createErrorEmbed(
			"Error",
			"An unexpected error occurred",
		);
		await interaction.editReply({ embeds: [errorEmbed] });
	}
}
