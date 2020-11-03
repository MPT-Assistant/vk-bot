"use strict";
import { Schema } from "mongoose";

const user: Schema = new Schema({
	id: Number,
	vk_id: Number,
	ban: Boolean,
	reg_date: Date,
	nickname: String,
	data: {
		unical_group_id: Number,
		google: {
			access_token: String,
			refresh_token: String,
			scope: String,
			token_type: String,
			expiry_data: Number,
		},
	},
});

const chat: Schema = new Schema({
	id: Number,
	unical_group_id: Number,
	inform: Boolean,
});

const lesson: Schema = new Schema({
	num: Number,
	name: [String],
	teacher: [String],
});

const replacement: Schema = new Schema({
	date: String,
	unical_group_id: Number,
	specialty_id: Number,
	group_id: Number,
	detected: Date,
	add_to_site: Date,
	lesson_num: Number,
	old_lesson_name: String,
	old_lesson_teacher: String,
	new_lesson_name: String,
	new_lesson_teacher: String,
});

const day: Schema = new Schema({
	num: Number,
	place: String,
	lessons: [lesson],
});

const group: Schema = new Schema({
	id: Number,
	uid: Number,
	name: String,
	weekly_schedule: [day],
});

const specialty: Schema = new Schema({
	id: Number,
	name: String,
	groups: [group],
});

const utilityGroup: Schema = new Schema({
	uid: Number,
	name: String,
	id: Number,
	specialty: String,
	specialty_id: Number,
});

const courseAnnouncement: Schema = new Schema({
	id: String,
	text: String,
	materials: [],
	status: String,
	link: String,
	created: Date,
	lastUpdate: Date,
});

const courseWork: Schema = new Schema({
	id: String,
	title: String,
	description: String,
	materials: [],
	status: String,
	link: String,
	created: Date,
	lastUpdate: Date,
	deadline: Date,
});

const courseScheme: Schema = new Schema({
	id: String,
	name: String,
	section: String,
	descriptionHeading: String,
	created: Date,
	lastUpdate: Date,
	link: String,
	status: String,
	announcements: [courseAnnouncement],
	works: [courseWork],
});

const classroomUser: Schema = new Schema({
	id: Number,
	courseList: [courseScheme],
	inform: Boolean,
});

const gmailUser: Schema = new Schema({
	email: String,
	inform: Boolean,
});

const googleScheme: Schema = new Schema({
	vk_id: Number,
	token: {
		access_token: String,
		refresh_token: String,
		scope: String,
		token_type: String,
		expiry_date: Number,
	},
	classroom: classroomUser,
	gmail: gmailUser,
});

export = {
	user,
	chat,
	group,
	specialty,
	replacement,
	utilityGroup,
	courseAnnouncement,
	courseScheme,
	courseWork,
	googleScheme,
};
