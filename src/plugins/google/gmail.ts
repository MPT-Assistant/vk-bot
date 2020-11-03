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
}

export { gmailUser };
