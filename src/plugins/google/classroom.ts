import { GoogleUserData } from "./../types";
import { classroom_v1, google as googleAPI } from "googleapis";
import { google } from "../google";

class classroomUser {
	private classroom: classroom_v1.Classroom;
	private getClassroomInstance(userData: GoogleUserData) {
		return googleAPI.classroom({
			version: "v1",
			auth: google.createUser_oAuth2Client(userData),
		});
	}

	constructor(userData: GoogleUserData) {
		this.classroom = this.getClassroomInstance(userData);
	}

	async getInstance(): Promise<classroom_v1.Classroom> {
		return this.classroom;
	}

	courses = {
		list: async (nextToken?: string) => {
			let coursesList = await this.classroom.courses.list({
				pageToken: nextToken || "",
			});
			let output = coursesList.data.courses || [];
			if (coursesList.data.nextPageToken) {
				let nextListData = await this.courses.list(
					coursesList.data.nextPageToken,
				);
				output = output.concat(nextListData);
			}
			return output;
		},
	};

	announcements = {
		list: async (courseID: string, nextToken?: string) => {
			let announcementsList = await this.classroom.courses.announcements.list({
				courseId: courseID,
				pageToken: nextToken || "",
			});
			let output = announcementsList.data.announcements || [];
			if (announcementsList.data.nextPageToken) {
				let nextListData = await this.announcements.list(
					announcementsList.data.nextPageToken,
				);
				output = output.concat(nextListData);
			}
			return output;
		},
		get: async (courseID: string, announcementID: string) => {
			let announcementData = await this.classroom.courses.announcements.get({
				courseId: courseID,
				id: announcementID,
			});
			return announcementData.data;
		},
	};
}

export { classroomUser };
