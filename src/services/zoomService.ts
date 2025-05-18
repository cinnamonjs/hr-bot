import axios from "axios";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { CommandResponse, ZoomMeeting } from "../interfaces";
import { Logger } from "../utils/logger";

export class ZoomService {
	private apiKey: string;
	private apiSecret: string;
	private accountId: string;

	constructor() {
		this.apiKey = config.zoom.apiKey || "";
		this.apiSecret = config.zoom.apiSecret || "";
		this.accountId = config.zoom.accountId || "";
	}

	private generateToken(): string {
		const payload = {
			iss: this.apiKey,
			exp: Math.floor(Date.now() / 1000) + 60 * 60,
		};

		return jwt.sign(payload, this.apiSecret);
	}

	async createMeeting(topic = "HR Meeting"): Promise<
		CommandResponse<{
			join_url: string;
			password: string;
			topic: string;
		}>
	> {
		try {
			Logger.info(`Creating Zoom meeting: ${topic}`);

			const token = this.generateToken();

			const response = await axios.post(
				"https://api.zoom.us/v2/users/me/meetings",
				{
					topic,
					type: 2,
					settings: {
						host_video: true,
						participant_video: true,
						join_before_host: true,
						mute_upon_entry: true,
						auto_recording: "none",
						waiting_room: false,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				},
			);

			const meetingData: ZoomMeeting = {
				id: response.data.id,
				password: response.data.password,
				join_url: response.data.join_url,
				topic: response.data.topic,
			};

			Logger.info(
				`Zoom meeting created successfully with ID: ${meetingData.id}`,
			);

			return {
				success: true,
				message: "Zoom meeting created successfully",
				data: meetingData,
			};
		} catch (error) {
			Logger.error("Error creating Zoom meeting", error);
			return {
				success: false,
				message: "Failed to create Zoom meeting",
			};
		}
	}
}
