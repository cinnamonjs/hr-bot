import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import type {
	Agenda,
	LearningResource,
	Minutes,
	Poll,
	StandupEntry,
} from "../interfaces";

export const EmbedUtils = {
	createBasicEmbed(title: string, description: string): EmbedBuilder {
		return new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor("#3498db")
			.setTimestamp()
			.setFooter({ text: "HR Bot" });
	},
	createSuccessEmbed(title: string, description: string): EmbedBuilder {
		return this.createBasicEmbed(title, description).setColor("#2ecc71");
	},
	createErrorEmbed(title: string, description: string): EmbedBuilder {
		return this.createBasicEmbed(title, description).setColor("#e74c3c");
	},
	createSheetEmbed(title: string, url: string): EmbedBuilder {
		return this.createSuccessEmbed(
			title,
			`Your Google Sheet has been created! [Click here to open](${url})`,
		).setThumbnail(
			"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Google_Sheets_2020_Logo.svg/1200px-Google_Sheets_2020_Logo.svg.png",
		);
	},
	createDocsEmbed(title: string, url: string): EmbedBuilder {
		return this.createSuccessEmbed(
			title,
			`Your Google Doc has been created! [Click here to open](${url})`,
		).setThumbnail(
			"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Google_Docs_logo_%282014-2020%29.svg/1200px-Google_Docs_logo_%282014-2020%29.svg.png",
		);
	},
	createZoomEmbed(meeting: {
		join_url: string;
		password: string;
		topic: string;
	}): EmbedBuilder {
		return this.createSuccessEmbed(
			`Zoom Meeting: ${meeting.topic}`,
			`A new Zoom meeting has been created!\n\n**Password:** ${meeting.password}\n\n[Click here to join the meeting](${meeting.join_url})`,
		).setThumbnail(
			"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png",
		);
	},
	createPrivateChannelEmbed(user: string, channel: string): EmbedBuilder {
		return this.createSuccessEmbed(
			"Private Channel Created",
			`A private channel has been created for <@${user}>. Please use </close:0> to close this channel when done.`,
		);
	},
	createPollEmbed(poll: Poll): EmbedBuilder {
		const totalVotes = poll.options.reduce(
			(acc, option) => acc + option.votes.length,
			0,
		);

		let optionsText = "";
		for (const option of poll.options) {
			const percentage =
				totalVotes > 0
					? Math.round((option.votes.length / totalVotes) * 100)
					: 0;
			const progressBar = this.generateProgressBar(percentage);
			optionsText += `${option.text}\n${progressBar} ${option.votes.length} votes (${percentage}%)\n\n`;
		}

		const expiresText = poll.expiresAt
			? `\n\nPoll expires <t:${Math.floor(poll.expiresAt.getTime() / 1000)}:R>`
			: "";

		return this.createBasicEmbed(
			poll.question,
			`${optionsText}Total votes: ${totalVotes}${expiresText}`,
		);
	},
	generateProgressBar(percentage: number): string {
		const filledBlocks = Math.round(percentage / 10);
		const emptyBlocks = 10 - filledBlocks;

		return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
	},
	createLearningResourceEmbed(resource: LearningResource): EmbedBuilder {
		const embed = this.createSuccessEmbed(
			`Learning Resource: ${resource.topic}`,
			`${resource.description || "No description provided."}\n\n[Click here to access the resource](${resource.link})`,
		);

		embed.addFields(
			{ name: "Added By", value: `<@${resource.addedBy}>`, inline: true },
			{
				name: "Added On",
				value: `<t:${Math.floor(resource.addedAt.getTime() / 1000)}:R>`,
				inline: true,
			},
		);

		return embed;
	},
	createLearningResourceListEmbed(
		resources: LearningResource[],
		page: number,
		totalPages: number,
	): EmbedBuilder {
		let description = "";

		if (resources.length === 0) {
			description = "No learning resources found.";
		} else {
			resources.forEach((resource, index) => {
				description += `**${index + 1}.** ${resource.topic}\n`;
				description += `- [View Resource](${resource.link})\n`;
				description += `- Added by <@${resource.addedBy}> on <t:${Math.floor(resource.addedAt.getTime() / 1000)}:D>\n\n`;
			});
		}

		return this.createBasicEmbed("Learning Resources", description).setFooter({
			text: `Page ${page}/${totalPages} • HR Bot`,
		});
	},
	createStandupEmbed(standup: StandupEntry): EmbedBuilder {
		return this.createBasicEmbed(
			`Daily Standup - <@${standup.userId}>`,
			`**Yesterday:**\n${standup.yesterday}\n\n**Today:**\n${standup.today}\n\n**Blockers:**\n${standup.blockers || "No blockers"}`,
		).setColor("#9B59B6");
	},
	createMinutesEmbed(minutes: Minutes): EmbedBuilder {
		const attendeesList = minutes.attendees.map((id) => `<@${id}>`).join(", ");

		return this.createBasicEmbed(
			`Meeting Minutes: ${minutes.title}`,
			`**Date:** <t:${Math.floor(minutes.date.getTime() / 1000)}:F>\n\n**Attendees:**\n${attendeesList}\n\n**Minutes:**\n${minutes.content}`,
		).setColor("#E67E22");
	},
	createAgendaEmbed(agenda: Agenda): EmbedBuilder {
		let description = `**Date:** <t:${Math.floor(agenda.date.getTime() / 1000)}:F>\n\n**Agenda Items:**\n`;

		agenda.items.forEach((item, index) => {
			description += `**${index + 1}. ${item.title}**\n`;
			if (item.description) description += `   ${item.description}\n`;
			if (item.presenter)
				description += `   Presented by: <@${item.presenter}>\n`;
			if (item.duration)
				description += `   Duration: ${item.duration} minutes\n`;
			description += "\n";
		});

		return this.createBasicEmbed(
			`Meeting Agenda: ${agenda.title}`,
			description,
		).setColor("#F1C40F");
	},
	createHelpEmbed(): EmbedBuilder {
		return this.createBasicEmbed(
			"HR Bot Commands",
			`Here are the available commands:

**Google Workspace:**
</sheet:0> - Create a new Google Sheet (optional template)
</docs:0> - Create a new Google Doc (optional template)

**Meeting Tools:**
</zoom:0> - Create a new Zoom meeting
</standup:0> - Submit or view team standup updates
</minutes:0> - Record or view meeting minutes
</agenda:0> - Create or view meeting agendas

**Collaboration:**
</poll:0> - Create or vote on polls
</learn:0> - Share or access learning resources
</learns:0> - View all learning resources

**Communication:**
</private:0> - Start a private conversation
</close:0> - Close a private conversation

**Help:**
</help:0> - Display this help message

Use </help:0> [command] for detailed information about a specific command.`,
		).setColor("#3498db");
	},
	createDetailedHelpEmbed(command: string): EmbedBuilder {
		let title = `Command: /${command}`;
		let description = "";

		switch (command) {
			case "sheet":
				description = `Creates a new Google Sheet with public access.

**Usage:**
</sheet:0> - Creates a sheet with default title
</sheet:0> [title] - Creates a sheet with specified title
</sheet:0> [template] - Creates a sheet from a template (if available)

**Options:**
\`title\` - Optional title for the sheet
\`template\` - Optional template to use (hr-timesheet, expense-tracker, etc.)`;
				break;

			case "docs":
				description = `Creates a new Google Doc with public access.

**Usage:**
</docs:0> - Creates a doc with default title
</docs:0> [title] - Creates a doc with specified title
</docs:0> [template] - Creates a doc from a template (if available)

**Options:**
\`title\` - Optional title for the document
\`template\` - Optional template to use (offer-letter, meeting-minutes, etc.)`;
				break;

			case "zoom":
				description = `Creates a new Zoom meeting with join link and password.

**Usage:**
</zoom:0> - Creates a meeting with default topic
</zoom:0> [topic] - Creates a meeting with specified topic

**Options:**
\`topic\` - Optional topic for the meeting`;
				break;

			case "poll":
				description = `Creates an interactive poll with options.

**Usage:**
</poll:0> create [question] [option1, option2, ...] - Creates a new poll
</poll:0> end [poll_id] - Ends an active poll

**Options:**
\`question\` - The poll question
\`options\` - Comma-separated list of poll options
\`duration\` - Optional poll duration in hours`;
				break;

			case "learn":
				description = `Share or retrieve learning resources.

**Usage:**
</learn:0> add [topic] [link] - Adds a new learning resource
</learn:0> [topic] - Finds resources matching the topic
</learn:0> delete [id] - Deletes a learning resource (creator only)

**Options:**
\`topic\` - The topic of the learning resource
\`link\` - URL to the learning resource
\`description\` - Optional description of the resource`;
				break;

			case "learns":
				description = `View all available learning resources with pagination.

**Usage:**
</learns:0> - Shows first page of resources
</learns:0> [page] - Shows specific page of resources

**Options:**
\`page\` - Optional page number`;
				break;

			case "standup":
				description = `Submit or view daily standup updates.

**Usage:**
</standup:0> submit - Submit your standup update
</standup:0> view [date] - View all standups for a date
</standup:0> view [@user] - View a specific user's standup

**Options:**
\`yesterday\` - What you accomplished yesterday
\`today\` - What you plan to do today
\`blockers\` - Any blockers you're facing`;
				break;

			case "minutes":
				description = `Record or view meeting minutes.

**Usage:**
</minutes:0> record [title] - Record new meeting minutes
</minutes:0> view [id] - View specific meeting minutes
</minutes:0> list - List recent meeting minutes

**Options:**
\`title\` - Title of the meeting
\`attendees\` - List of meeting attendees
\`content\` - Meeting minutes content`;
				break;

			case "agenda":
				description = `Create or view meeting agendas.

**Usage:**
</agenda:0> create [title] - Create a new meeting agenda
</agenda:0> view [id] - View a specific agenda
</agenda:0> list - List upcoming agendas

**Options:**
\`title\` - Title of the meeting
\`date\` - Date of the meeting
\`items\` - Agenda items to include`;
				break;

			case "private":
				description = `Create a private channel with another user.

**Usage:**
</private:0> [@user] - Creates a private channel with the specified user

**Options:**
\`user\` - The user to create a private channel with`;
				break;

			case "close":
				description = `Close a private channel.

**Usage:**
</close:0> - Closes the current private channel`;
				break;

			case "help":
				description = `Display help information.

**Usage:**
</help:0> - Shows list of all commands
</help:0> [command] - Shows detailed help for a specific command

**Options:**
\`command\` - Optional command name to get detailed help`;
				break;

			default:
				title = "Command Not Found";
				description = `The command \`/${command}\` was not found. Use </help:0> to see a list of all available commands.`;
		}

		return this.createBasicEmbed(title, description);
	},
	createLinkButton(
		label: string,
		url: string,
	): ActionRowBuilder<ButtonBuilder> {
		const button = new ButtonBuilder()
			.setLabel(label)
			.setURL(url)
			.setStyle(ButtonStyle.Link);

		return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
	},
	createActionButton(
		label: string,
		customId: string,
		style: ButtonStyle = ButtonStyle.Primary,
	): ActionRowBuilder<ButtonBuilder> {
		const button = new ButtonBuilder()
			.setLabel(label)
			.setCustomId(customId)
			.setStyle(style);

		return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
	},
	createPollButtons(
		pollId: string,
		options: { id: string; text: string }[],
	): ActionRowBuilder<ButtonBuilder>[] {
		const rows: ActionRowBuilder<ButtonBuilder>[] = [];

		for (let i = 0; i < options.length; i += 5) {
			const row = new ActionRowBuilder<ButtonBuilder>();

			const optionsSlice = options.slice(i, i + 5);
			for (const option of optionsSlice) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(`poll_vote_${pollId}_${option.id}`)
						.setLabel(
							option.text.length > 25
								? `${option.text.substring(0, 22)}...`
								: option.text,
						)
						.setStyle(ButtonStyle.Primary),
				);
			}

			rows.push(row);
		}

		if (options.length > 0) {
			rows.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(`poll_end_${pollId}`)
						.setLabel("End Poll")
						.setStyle(ButtonStyle.Danger),
				),
			);
		}

		return rows;
	},
	createPaginationButtons(
		currentPage: number,
		totalPages: number,
		baseCustomId: string,
	): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();

		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`${baseCustomId}_prev_${currentPage}`)
				.setLabel("Previous")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage <= 1),
		);

		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`${baseCustomId}_page_${currentPage}`)
				.setLabel(`Page ${currentPage} of ${totalPages}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
		);

		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`${baseCustomId}_next_${currentPage}`)
				.setLabel("Next")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage >= totalPages),
		);

		return row;
	},
	createTemplateSelectMenu(
		templateType: "sheet" | "docs",
		customId: string,
	): ActionRowBuilder<StringSelectMenuBuilder> {
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(customId)
			.setPlaceholder(`Select a ${templateType} template...`);

		if (templateType === "sheet") {
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("Blank Sheet")
					.setDescription("Create a blank spreadsheet")
					.setValue("blank")
					.setDefault(true),
				new StringSelectMenuOptionBuilder()
					.setLabel("HR Timesheet")
					.setDescription("Timesheet template for tracking hours")
					.setValue("timesheet"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Expense Tracker")
					.setDescription("Template for tracking expenses")
					.setValue("expenses"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Employee Directory")
					.setDescription("Template for employee information")
					.setValue("directory"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Project Tracker")
					.setDescription("Template for tracking project status")
					.setValue("project"),
			);
		} else {
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("Blank Document")
					.setDescription("Create a blank document")
					.setValue("blank")
					.setDefault(true),
				new StringSelectMenuOptionBuilder()
					.setLabel("Offer Letter")
					.setDescription("Template for creating offer letters")
					.setValue("offer"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Meeting Minutes")
					.setDescription("Template for recording meeting minutes")
					.setValue("minutes"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Performance Review")
					.setDescription("Template for performance reviews")
					.setValue("review"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Onboarding Checklist")
					.setDescription("Template for employee onboarding")
					.setValue("onboarding"),
			);
		}

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectMenu,
		);
	},
};
