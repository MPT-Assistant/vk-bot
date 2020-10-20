import { GoogleUserData } from "./../types";
import { google as googleAPI, oauth2_v2 } from "googleapis";
import { google } from "../google";

class classroomUser {
	private classroom: any;
	private getClassroomInstance(userData: GoogleUserData) {
		return googleAPI.classroom({
			version: "v1",
			auth: google.createUser_oAuth2Client(userData),
		});
	}

	constructor(userData: GoogleUserData) {
		this.classroom = this.getClassroomInstance(userData);
	}

	async getCourses() {
		let user = await this.classroom.courses.list();
		return user.data;
	}
}

export { classroomUser };
