import { GoogleUserData } from "./types";
import { google as googleAPI } from "googleapis";
import { classroom } from "./google/classroom";

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
	create_oAuth2Client: async () => {
		const oAuth2Client = new googleAPI.auth.OAuth2(
			googleCredentials.installed.client_id,
			googleCredentials.installed.client_secret,
			googleCredentials.installed.redirect_uris[0],
		);
		return oAuth2Client;
	},
	getURLtoGetToken: async () => {
		const oAuth2Client = await google.create_oAuth2Client();
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://mail.google.com/",
				"https://www.googleapis.com/auth/drive",
				"https://www.googleapis.com/auth/classroom.courses",
				"https://www.googleapis.com/auth/classroom.rosters",
				"https://www.googleapis.com/auth/classroom.coursework.me",
				"https://www.googleapis.com/auth/classroom.coursework.students",
				"https://www.googleapis.com/auth/classroom.announcements",
				"https://www.googleapis.com/auth/classroom.guardianlinks.students",
				"https://www.googleapis.com/auth/classroom.profile.photos",
				"https://www.googleapis.com/auth/classroom.profile.emails",
			],
		});
		return authUrl;
	},
	refreshToken: async (userData: GoogleUserData) => {
		const oAuth2Client = await google.create_oAuth2Client();
		oAuth2Client.setCredentials(userData);
		return (await oAuth2Client.getAccessToken()).token;
	},
	getUserTokenByTempToken: async (accessCode: string) => {
		const oAuth2Client = await google.create_oAuth2Client();
		let userToken = await oAuth2Client.getToken(accessCode);
		return userToken.tokens;
	},
};

export { google, classroom };
