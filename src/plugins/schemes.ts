"use strict";
import { Schema } from "mongoose";
import { createSchema, Type } from "ts-mongoose";

const user: Schema = new Schema({
	id: Number,
	vk_id: Number,
	ban: Boolean,
	reg_date: Date,
	nickname: String,
	data: {
		unical_group_id: String,
		lesson_notices: Boolean,
		replacement_notices: Boolean,
		mailing: Boolean,
	},
});

const chat: Schema = new Schema({
	id: Number,
	unical_group_id: String,
	inform: Boolean,
	mailing: Boolean,
});

const lesson: Schema = new Schema({
	num: Number,
	name: [String],
	teacher: [String],
});

const replacement: Schema = new Schema({
	date: String,
	unical_group_id: String,
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
	id: String,
	uid: String,
	name: String,
	weekly_schedule: [day],
});

const specialty: Schema = new Schema({
	uid: String,
	name: String,
	groups: [group],
});

const utilityGroup: Schema = new Schema({
	uid: String,
	name: String,
	id: String,
	specialty: String,
	specialty_id: String,
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

const courseWork = createSchema({
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

const courseScheme = createSchema({
	id: Type.string(),
	name: Type.string(),
	section: Type.string(),
	descriptionHeading: Type.string(),
	created: Date,
	lastUpdate: Date,
	link: Type.string(),
	status: Type.string(),
	announcements: Type.array().of(courseAnnouncement),
	works: Type.array().of(courseWork),
});

const classroomUser = createSchema({
	id: Type.number(),
	courseList: Type.array().of(courseScheme),
	inform: Type.boolean(),
});

const gmailUser = createSchema({
	email: Type.string(),
	inform: Type.boolean(),
});

const googleScheme = createSchema({
	vk_id: Type.number(),
	token: {
		access_token: Type.string(),
		refresh_token: Type.string(),
		scope: Type.string(),
		token_type: Type.string(),
		expiry_date: Type.number(),
	},
	classroom: Type.schema().of(classroomUser),
	gmail: Type.schema().of(gmailUser),
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
