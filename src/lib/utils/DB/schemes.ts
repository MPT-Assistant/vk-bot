import { createSchema, Type } from "ts-mongoose";

const LessonScheme = {
	num: Type.number({ required: true }),
	name: Type.array({ required: true }).of(Type.string({ required: true })),
	teacher: Type.array({ required: true }).of(Type.string({ required: true })),
};

const DaySchema = {
	num: Type.number({ required: true }),
	place: Type.string({ required: true }),
	name: Type.string({ required: true }),
	lessons: Type.array({ required: true }).of(LessonScheme),
};

const GroupSchema = createSchema({
	name: Type.string({ required: true }),
	specialty: Type.string({ required: true }),
	schedule: Type.array({ required: true }).of(DaySchema),
});

const SpecialtySchema = createSchema({
	name: Type.string({ required: true }),
	groups: Type.array({ required: true }).of(Type.string({ required: true })),
});

const ReplacementSchema = createSchema({
	date: Type.date({ required: true }),
	group: Type.string({ required: true }),
	detected: Type.date({ required: true }),
	addToSite: Type.date({ required: true }),
	lessonNum: Type.number({ required: true }),
	oldLessonName: Type.string({ required: true }),
	oldLessonTeacher: Type.string({ required: true }),
	newLessonName: Type.string({ required: true }),
	newLessonTeacher: Type.string({ required: true }),
	hash: Type.string({ required: true }),
});

const DumpSchema = createSchema({
	date: Type.date({ required: true }),
	data: Type.mixed({ required: true }),
});

const UserSchema = createSchema({
	id: Type.number({ required: true, unique: true }),
	nickname: Type.string({ required: true }),
	ban: Type.boolean({ required: true }),
	group: Type.string({ required: true }),
	inform: Type.boolean({ required: true }),
	reported_replacements: Type.array({ required: true }).of(
		Type.string({ required: true }),
	),
	reg_date: Type.date({ required: true }),
});

const ChatSchema = createSchema({
	id: Type.number({ required: true, unique: true }),
	group: Type.string({ required: true }),
	inform: Type.boolean({ required: true }),
	reported_replacements: Type.array({ required: true }).of(
		Type.string({ required: true }),
	),
});

export {
	DaySchema,
	GroupSchema,
	SpecialtySchema,
	ReplacementSchema,
	DumpSchema,
	UserSchema,
	ChatSchema,
};
