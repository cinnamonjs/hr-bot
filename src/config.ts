import { GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

export const config = {
	discord: {
		token: process.env.DISCORD_TOKEN,
		clientId: process.env.CLIENT_ID,
		guildId: process.env.GUILD_ID,
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.DirectMessages,
		],
		partials: [Partials.Channel, Partials.Message],
	},
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		redirectUri: process.env.GOOGLE_REDIRECT_URI,
		refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
	},
	zoom: {
		apiKey: process.env.ZOOM_API_KEY,
		apiSecret: process.env.ZOOM_API_SECRET,
		accountId: process.env.ZOOM_ACCOUNT_ID,
	},
};
