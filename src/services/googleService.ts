import { google } from "googleapis";
import { config } from "../config";
import type { CommandResponse } from "../interfaces";
import { Logger } from "../utils/logger";

export class GoogleService {
	private oauth2Client;
	private drive;
	private sheets;
	private docs;

	constructor() {
		this.oauth2Client = new google.auth.OAuth2(
			config.google.clientId,
			config.google.clientSecret,
			config.google.redirectUri,
		);

		this.oauth2Client.setCredentials({
			refresh_token: config.google.refreshToken,
		});

		this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
		this.sheets = google.sheets({ version: "v4", auth: this.oauth2Client });
		this.docs = google.docs({ version: "v1", auth: this.oauth2Client });
	}

	async createSheet(
		title: string,
		template?: string,
	): Promise<CommandResponse<{ spreadsheetId: string; link: string }>> {
		try {
			Logger.info(
				`Creating Google Sheet: ${title} with template: ${template || "none"}`,
			);

			const created = await this.sheets.spreadsheets.create({
				requestBody: {
					properties: {
						title,
					},
				},
			});

			const spreadsheetId = created.data.spreadsheetId;

			if (template && spreadsheetId) {
				await this.applyTemplate(spreadsheetId, template);
			}
			if (spreadsheetId) {
				return {
					success: true,
					message: "Sheet created successfully.",
					data: {
						spreadsheetId,
						link: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
					},
				};
			}
			return {
				success: false,
				message: "Error creating sheet no spreadsheet id received",
			};
		} catch (e: unknown) {
			Logger.error("Failed to create sheet:", e);
			return {
				success: false,
				message: `Error creating sheet: ${(e as Error)?.message || "Unknown error"}`,
			};
		}
	}

	async createDoc(
		title: string,
		template?: string,
	): Promise<CommandResponse<{ documentId: string; url: string }>> {
		try {
			Logger.info(
				`Creating Google Doc: ${title} with template: ${template || "none"}`,
			);

			const doc = await this.docs.documents.create({
				requestBody: {
					title,
				},
			});

			const documentId = doc.data.documentId;

			if (template && documentId) {
				await this.applyDocTemplate(documentId, template);
			}

			const url = `https://docs.google.com/document/d/${documentId}/edit`;
			if (documentId && url) {
				return {
					success: true,
					message: "Document created successfully.",
					data: { documentId, url },
				};
			}
			return {
				success: false,
				message: "Failed to create Google Doc.",
			};
		} catch (error) {
			Logger.error("Failed to create Google Doc", error);
			return {
				success: false,
				message: "Failed to create Google Doc.",
			};
		}
	}

	private async applyTemplate(spreadsheetId: string, template: string) {
		const templates: Record<string, unknown[]> = {
			todo: [
				{
					updateSheetProperties: {
						properties: {
							title: "Tasks",
						},
						fields: "title",
					},
				},
				{
					updateCells: {
						start: { sheetId: 0, rowIndex: 0, columnIndex: 0 },
						rows: [
							{
								values: [
									{ userEnteredValue: { stringValue: "Task" } },
									{ userEnteredValue: { stringValue: "Assigned To" } },
									{ userEnteredValue: { stringValue: "Status" } },
									{ userEnteredValue: { stringValue: "Due Date" } },
								],
							},
						],
						fields: "*",
					},
				},
			],
			inventory: [
				{
					updateSheetProperties: {
						properties: {
							title: "Inventory",
						},
						fields: "title",
					},
				},
				{
					updateCells: {
						start: { sheetId: 0, rowIndex: 0, columnIndex: 0 },
						rows: [
							{
								values: [
									{ userEnteredValue: { stringValue: "Item" } },
									{ userEnteredValue: { stringValue: "Quantity" } },
									{ userEnteredValue: { stringValue: "Location" } },
									{ userEnteredValue: { stringValue: "Last Updated" } },
								],
							},
						],
						fields: "*",
					},
				},
			],
		};

		const requests = templates[template];
		if (!requests) {
			Logger.warn(`No template found for: ${template}`);
			return;
		}

		await this.sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: {
				requests: requests as [],
			},
		});

		Logger.info(`Applied template: ${template}`);
	}

	private async applyDocTemplate(documentId: string, template: string) {
		const templates: Record<string, string> = {
			meeting_notes: `# Meeting Notes
      
      **Date:**  
      **Attendees:**  
      **Agenda:**  
      1.  
      2.  
      3.  
      
      **Action Items:**  
      - [ ]  
      - [ ]  
      - [ ]  
      `,

			project_summary: `# Project Summary
      
      **Project Name:**  
      **Start Date:**  
      **End Date:**  
      **Status:**  
      **Summary:**  
      
      ## Milestones  
      -  
      -  
      -  
      `,

			proposal: `# Proposal
      
      **Title:**  
      **Author:**  
      **Date:**  
      
      ## Problem Statement  
      ...
      
      ## Proposed Solution  
      ...
      
      ## Timeline  
      ...
      
      ## Budget  
      ...
      `,
		};

		const content = templates[template];
		if (!content) {
			Logger.warn(`No doc template found for: ${template}`);
			return;
		}

		await this.docs.documents.batchUpdate({
			documentId,
			requestBody: {
				requests: [
					{
						insertText: {
							location: { index: 1 },
							text: content,
						},
					},
				],
			},
		});

		Logger.info(`Applied doc template: ${template}`);
	}
}
