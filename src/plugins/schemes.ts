"use strict";
import { Schema } from "mongoose";
import { createSchema, Type } from "ts-mongoose";

const user = createSchema({
	id: Type.number(),
	vk_id: Type.number(),
	ban: Type.boolean(),
	reg_date: Type.date(),
	nickname: Type.string(),
	data: {
		unical_group_id: Type.string(),
		lesson_notices: Type.boolean(),
		replacement_notices: Type.boolean(),
		mailing: Type.boolean(),
	},
});

const chat = createSchema({
	id: Type.number(),
	unical_group_id: Type.string(),
	inform: Type.boolean(),
	mailing: Type.boolean(),
});

const lesson = createSchema({
	num: Type.number(),
	name: Type.array().of(Type.string()),
	teacher: Type.array().of(Type.string()),
});

const replacement = createSchema({
	date: Type.string(),
	unical_group_id: Type.string(),
	detected: Type.date(),
	add_to_site: Type.date(),
	lesson_num: Type.number(),
	old_lesson_name: Type.string(),
	old_lesson_teacher: Type.string(),
	new_lesson_name: Type.string(),
	new_lesson_teacher: Type.string(),
});

const day = createSchema({
	num: Type.string(),
	place: Type.string(),
	lessons: Type.array().of(lesson),
});

const group = createSchema({
	id: Type.string(),
	uid: Type.string(),
	name: Type.string(),
	weekly_schedule: Type.array().of(day),
});

const specialty = createSchema({
	uid: Type.string(),
	name: Type.string(),
	groups: Type.array().of(group),
});

const utilityGroup = createSchema({
	uid: Type.string(),
	name: Type.string(),
	id: Type.string(),
	specialty: Type.string(),
	specialty_id: Type.string(),
});

const materialScheme = createSchema({
	driveFile: Type.object().of({
		id: Type.string(),
		title: Type.string(),
		url: Type.string(),
	}),
	youtubeVideo: Type.object().of({
		id: Type.string(),
		title: Type.string(),
		url: Type.string(),
	}),
	link: Type.object().of({
		title: Type.string(),
		url: Type.string(),
	}),
});

const courseAnnouncement = createSchema({
	id: Type.string(),
	text: Type.string(),
	materials: Type.array().of(materialScheme),
	status: Type.string(),
	link: Type.string(),
	created: Type.date(),
	lastUpdate: Type.date(),
});

const courseWork = createSchema({
	id: Type.string(),
	title: Type.string(),
	description: Type.string(),
	materials: Type.array().of(materialScheme),
	status: Type.string(),
	link: Type.string(),
	created: Type.date(),
	lastUpdate: Type.date(),
	deadline: Type.date(),
});

const courseScheme = createSchema({
	id: Type.string(),
	name: Type.string(),
	descriptionHeading: Type.string(),
	created: Type.date(),
	lastUpdate: Type.date(),
	link: Type.string(),
	status: Type.string(),
	announcements: Type.array().of(courseAnnouncement),
	works: Type.array().of(courseWork),
});

const classroomSection = createSchema({
	courseList: Type.array().of(courseScheme),
	last_update: Type.date(),
	inform: Type.boolean(),
});

const gmailSection = createSchema({
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
	email: Type.string(),
	last_update: Type.date(),
	classroom: Type.schema().of(classroomSection),
	gmail: Type.schema().of(gmailSection),
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
