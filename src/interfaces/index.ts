import type { ChatInputCommandInteraction } from "discord.js";

export interface CommandResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
}

export interface PrivateChannel {
	userId: string;
	channelId: string;
	createdAt: Date;
}

export interface ChatCommand {
	data?: { name: string };
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ZoomMeeting {
	id: string;
	password: string;
	join_url: string;
	topic: string;
}

export interface LearningResource {
	id: string;
	topic: string;
	link: string;
	addedBy: string;
	addedAt: Date;
	description?: string;
}

export interface PollOption {
	id: string;
	text: string;
	votes: string[];
}

export interface Poll {
	id: string;
	question: string;
	options: PollOption[];
	createdBy: string;
	createdAt: Date;
	expiresAt?: Date;
	channelId: string;
	messageId: string;
	isActive: boolean;
}

export interface StandupEntry {
	userId: string;
	date: Date;
	yesterday: string;
	today: string;
	blockers: string;
}

export interface Minutes {
	id: string;
	title: string;
	date: Date;
	attendees: string[];
	content: string;
	createdBy: string;
}

export interface AgendaItem {
	id: string;
	title: string;
	description?: string;
	duration?: number;
	presenter?: string;
}

export interface Agenda {
	id: string;
	title: string;
	date: Date;
	items: AgendaItem[];
	createdBy: string;
}
