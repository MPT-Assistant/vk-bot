"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const user = new Schema({
	id: Number,
	vk_id: Number,
	ban: Boolean,
	reg_date: Date,
	nickname: String,
	data: {
		unical_group_id: Number,
	},
});

const chat = new Schema({
	id: Number,
	unical_group_id: Number,
	inform: Boolean,
});

const lesson = new Schema({
	num: Number,
	name: [String],
	teacher: [String],
});

const replacement = new Schema({
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

const day = new Schema({
	num: Number,
	place: String,
	lessons: [lesson],
});

const group = new Schema({
	id: Number,
	uid: Number,
	name: String,
	weekly_schedule: [day],
});

const specialty = new Schema({
	id: Number,
	name: String,
	groups: [group],
});

const utility_group = new Schema({
	uid: Number,
	name: String,
	id: Number,
	specialty: String,
	specialty_id: Number,
});

export = {
	user,
	chat,
	group,
	specialty,
	replacement,
	utility_group,
};
