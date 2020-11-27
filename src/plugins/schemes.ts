"use strict";
import { createSchema, Type, typedModel } from "ts-mongoose";

const user = createSchema({
	id: Type.number({ required: true }),
	vk_id: Type.number({ required: true }),
	ban: Type.boolean({ required: true }),
	reg_date: Type.date({ required: true }),
	nickname: Type.string({ required: true }),
	data: {
		unical_group_id: Type.string({ required: true }),
		lesson_notices: Type.boolean({ required: true }),
		replacement_notices: Type.boolean({ required: true }),
		mailing: Type.boolean({ required: true }),
	},
});

const chat = createSchema({
	id: Type.number({ required: true }),
	unical_group_id: Type.string({ required: true }),
	inform: Type.boolean({ required: true }),
	mailing: Type.boolean({ required: true }),
});

const lesson = createSchema({
	num: Type.number({ required: true }),
	name: Type.array({ required: true }).of(Type.string({ required: true })),
	teacher: Type.array({ required: true }).of(Type.string({ required: true })),
});

const replacement = createSchema({
	date: Type.string({ required: true }),
	unical_group_id: Type.string({ required: true }),
	detected: Type.date({ required: true }),
	add_to_site: Type.date({ required: true }),
	lesson_num: Type.number({ required: true }),
	old_lesson_name: Type.string({ required: true }),
	old_lesson_teacher: Type.string({ required: true }),
	new_lesson_name: Type.string({ required: true }),
	new_lesson_teacher: Type.string({ required: true }),
});

const day = createSchema({
	num: Type.string({ required: true }),
	place: Type.string({ required: true }),
	lessons: Type.array({ required: true }).of(lesson),
});

const group = createSchema({
	id: Type.string({ required: true }),
	uid: Type.string({ required: true }),
	name: Type.string({ required: true }),
	weekly_schedule: Type.array({ required: true }).of(day),
});

const specialty = createSchema({
	uid: Type.string({ required: true }),
	name: Type.string({ required: true }),
	groups: Type.array({ required: true }).of(group),
});

const utilityGroup = createSchema({
	uid: Type.string({ required: true }),
	name: Type.string({ required: true }),
	id: Type.string({ required: true }),
	specialty: Type.string({ required: true }),
	specialty_id: Type.string({ required: true }),
});

const materialScheme = createSchema({
	driveFile: Type.object({ required: true }).of({
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
