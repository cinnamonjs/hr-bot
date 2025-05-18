import {
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
} from "discord.js";
import { config } from "./config";
import * as docsCommand from "./controllers/docController";
import * as privateCommand from "./controllers/privateController";
import * as sheetCommand from "./controllers/sheetController";
import * as zoomCommand from "./controllers/zoomController";
import type { ChatCommand } from "./interfaces";
import { LogLevel, Logger } from "./utils/logger";

const client = new Client({
	intents: config.discord.intents,
	partials: config.discord.partials,
});

const commands = new Collection<string, ChatCommand>();
commands.set(sheetCommand.data.name, sheetCommand);
commands.set(zoomCommand.data.name, zoomCommand);
commands.set(docsCommand.data.name, docsCommand);
commands.set(privateCommand.data.name, privateCommand);
commands.set("close", { execute: privateCommand.handleCloseCommand });

client.once(Events.ClientReady, (readyClient) => {
	Logger.info(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = commands.get(interaction.commandName);

			if (!command) {
				Logger.warn(`Command not found: ${interaction.commandName}`);
				return;
			}

			Logger.info(`Executing command: ${interaction.commandName}`);
			await command.execute(interaction);
		}

		if (interaction.isButton()) {
			if (interaction.customId.startsWith("close_")) {
				await privateCommand.handleCloseButton(interaction);
			}
		}
	} catch (error) {
		Logger.error("Error handling interaction", error);

		const replyPayload = {
			content: "There was an error while executing this command!",
			ephemeral: true,
		};

		if (interaction instanceof ChatInputCommandInteraction) {
			if (interaction.deferred || interaction.replied) {
				await interaction.followUp(replyPayload);
			} else {
				await interaction.reply(replyPayload);
			}
		}
	}
});

client.login(config.discord.token).catch((error) => {
	Logger.error("Failed to log in to Discord", error);
	process.exit(1);
});

process.on("SIGINT", () => {
	Logger.info("Bot is shutting down...");
	client.destroy();
	process.exit(0);
});

process.on("uncaughtException", (error) => {
	Logger.error("Uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
	Logger.error("Unhandled rejection", reason);
});

export { client };
