import { GoogleUserData } from "./../types";
import { gmail_v1, google as googleAPI } from "googleapis";
import { google } from "../google";

class gmailUser {
	private gmail: gmail_v1.Gmail;
	private getGmailInstance(userData: GoogleUserData) {
		return googleAPI.gmail({
			version: "v1",
			auth: google.createUser_oAuth2Client(userData),
		});
	}

	constructor(userData: GoogleUserData) {
		this.gmail = this.getGmailInstance(userData);
	}

	async getInstance(): Promise<gmail_v1.Gmail> {
		return this.gmail;
	}

	async getEmailAddress(): Promise<string> {
		let data = await this.gmail.users.getProfile({ userId: `me` });
		if (data.data.emailAddress) {
			return data.data.emailAddress;
		} else {
			throw new Error(`Unknown error`);
		}
	}
}

export { gmailUser };
