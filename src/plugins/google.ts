import { GoogleUserData, userGoogleInterface } from "./types";
import models from "./models";
import { google as googleAPI, classroom_v1 } from "googleapis";
import { config } from "./core";

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

class GoogleUser {
	private userId: number;
	private autoSave: boolean;
	private getClassroomInstance(userData: GoogleUserData) {
		return googleAPI.classroom({
			version: "v1",
			auth: google.createUser_oAuth2Client(userData),
		});
	}
	//@ts-ignore
	private classroomAPI: classroom_v1.Classroom = null;

	private getGmailInstance(userData: GoogleUserData) {
		return googleAPI.gmail({
			version: "v1",
			auth: google.createUser_oAuth2Client(userData),
		});
	}
	//@ts-ignore
	private gmailAPI: gmail_v1.Gmail = null;
	//@ts-ignore
	userData: userGoogleInterface | null = undefined;

	constructor(userId: number, autoSave?: boolean) {
		this.autoSave = autoSave || false;
		this.userId = userId;
	}

	async init(): Promise<boolean> {
		this.userData = await models.userGoogle.findOne({
			vk_id: this.userId,
		});
		if (!this.userData) {
			return false;
		} else {
			//@ts-ignore
			this.classroomAPI = this.getClassroomInstance(this.userData.token);
			//@ts-ignore
			this.gmailAPI = this.getGmailInstance(this.userData.token);

			this.classroom.api = this.classroomAPI;
			this.gmail.api = this.gmailAPI;
			return true;
		}
	}

	async getTokenInfo() {
		//@ts-ignore
		return await google.getTokenInfo(this.userData?.token);
	}

	async refreshToken(): Promise<true> {
		//@ts-ignore
		this.userData?.token.access_token = await google.refreshToken(
			//@ts-ignore
			this.userData?.token,
		);
		this.autoSave ? await this.save() : false;
		return true;
	}

	async save(): Promise<true> {
		await this.userData?.save();
		return true;
	}

	classroom = {
		api: this.classroomAPI,
		courses: {
			list: async (nextToken?: string) => {
				let coursesList = await this.classroomAPI.courses.list({
					pageToken: nextToken || "",
				});
				let output = coursesList.data.courses || [];
				if (coursesList.data.nextPageToken) {
					let nextListData = await this.classroom.courses.list(
						coursesList.data.nextPageToken,
					);
					output = output.concat(nextListData);
				}
				return output;
			},
		},
		announcements: {
			list: async (courseID: string, nextToken?: string) => {
				let announcementsList = await this.classroomAPI.courses.announcements.list(
					{
						courseId: courseID,
						pageToken: nextToken || "",
					},
				);
				let output = announcementsList.data.announcements || [];
				if (announcementsList.data.nextPageToken) {
					let nextListData = await this.classroom.announcements.list(
						announcementsList.data.nextPageToken,
					);
					output = output.concat(nextListData);
				}
				return output;
			},
			get: async (courseID: string, announcementID: string) => {
				let announcementData = await this.classroomAPI.courses.announcements.get(
					{
						courseId: courseID,
						id: announcementID,
					},
				);
				return announcementData.data;
			},
		},
	};

	gmail = {
		api: this.gmailAPI,
		getEmailAddress: async (): Promise<string> => {
			let data = await this.gmailAPI.users.getProfile({ userId: `me` });
			return data.data.emailAddress;
		},
	};
}

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
			scope: config.googleScopes,
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

	checkToken: async (userData: GoogleUserData) => {
		let userTokenInfo = await google.getTokenInfo(userData);
	},

	getTokenInfo: async (userData: GoogleUserData) => {
		return await google
			.createUser_oAuth2Client(userData)
			.getTokenInfo(userData.access_token);
	},
};

export { google, GoogleUser };
