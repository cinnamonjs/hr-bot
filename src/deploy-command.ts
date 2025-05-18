import { REST, Routes } from "discord.js";
import { config } from "./config";
import * as docsCommand from "./controllers/docController";
import * as privateCommand from "./controllers/privateController";
import * as sheetCommand from "./controllers/sheetController";
import * as zoomCommand from "./controllers/zoomController";
import { Logger } from "./utils/logger";

const commands = [
	sheetCommand.data.toJSON(),
	zoomCommand.data.toJSON(),
	docsCommand.data.toJSON(),
	privateCommand.data.toJSON(),
	{
		name: "close",
		description: "Close a private channel",
	},
];

const rest = new REST({ version: "10" }).setToken(config.discord.token || "");

async function deployCommands() {
	try {
		Logger.info(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		const data = await rest.put(
			Routes.applicationGuildCommands(
				config.discord.clientId || "",
				config.discord.guildId || "",
			),
			{ body: commands },
		);

		Logger.info("Successfully reloaded application (/) commands.");
	} catch (error) {
		Logger.error("Error deploying commands:", error);
	}
}

if (import.meta.url === new URL(import.meta.url).href) {
	deployCommands();
}
