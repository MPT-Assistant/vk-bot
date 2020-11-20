import { GoogleUserData } from "./types";
import { google as googleAPI } from "googleapis";
import { classroomUser } from "./google/classroom";

const googleCredentials: {
	installed: {
		client_id: string;
		project_id: string;
		auth_uri: string;
		token_uri: string;
		auth_provider_x509_cert_url: string;
		client_secret: string;
		redirect_uris: Array<string>;
	};
} = require(`../DB/google.json`);

const google = {
	create_oAuth2Client: () => {
		const oAuth2Client = new googleAPI.auth.OAuth2(
			googleCredentials.installed.client_id,
			googleCredentials.installed.client_secret,
			googleCredentials.installed.redirect_uris[0],
		);
		return oAuth2Client;
	},
	createUser_oAuth2Client: (userData: GoogleUserData) => {
		let oAuth2Client = google.create_oAuth2Client();
		oAuth2Client.setCredentials(userData);
		return oAuth2Client;
	},
	getURLtoGetToken: async () => {
		const oAuth2Client = google.create_oAuth2Client();
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://mail.google.com/",
				"https://www.googleapis.com/auth/drive",
				"https://www.googleapis.com/auth/classroom.courses.readonly",
				"https://www.googleapis.com/auth/classroom.coursework.me.readonly",
				"https://www.googleapis.com/auth/classroom.announcements.readonly",
			],
		});
		return authUrl;
	},
	refreshToken: async (userData: GoogleUserData) => {
		const oAuth2Client = google.create_oAuth2Client();
		oAuth2Client.setCredentials(userData);
		return (await oAuth2Client.getAccessToken()).token;
	},
	getUserDataByTempToken: async (
		accessCode: string,
	): Promise<GoogleUserData> => {
		const oAuth2Client = google.create_oAuth2Client();
		let userToken = await oAuth2Client.getToken(accessCode);
		if (
			!userToken.tokens.access_token ||
			!userToken.tokens.expiry_date ||
			!userToken.tokens.refresh_token ||
			!userToken.tokens.scope ||
			!userToken.tokens.token_type
		) {
			throw new Error(`Invalid token`);
		} else {
			return {
				access_token: userToken.tokens.access_token,
				refresh_token: userToken.tokens.refresh_token,
				scope: userToken.tokens.scope,
				token_type: userToken.tokens.token_type,
				expiry_date: userToken.tokens.expiry_date,
			};
		}
	},
};

export { google, classroomUser };
