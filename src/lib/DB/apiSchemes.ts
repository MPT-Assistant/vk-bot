import { createSchema, Type } from "ts-mongoose";

const lessonSchema = createSchema(
	{
		num: Type.number({ required: true }),
		name: Type.array({ required: true }).of(Type.string({ required: true })),
		teacher: Type.array({ required: true }).of(Type.string({ required: true })),
	},
	{ _id: false },
);

const daySchema = createSchema(
	{
		num: Type.number({ required: true }),
		place: Type.string({ required: true }),
		name: Type.string({ required: true }),
		lessons: Type.array({ required: true }).of(lessonSchema),
	},
	{ _id: false },
);

const groupSchema = createSchema(
	{
		name: Type.string({ required: true, unique: true }),
		specialty: Type.string({ required: true }),
		schedule: Type.array({ required: true }).of(daySchema),
	},
	{ versionKey: false },
);

const replacementSchema = createSchema(
	{
		date: Type.date({ required: true }),
		group: Type.string({ required: true }),
		detected: Type.date({ required: true }),
		addToSite: Type.date({ required: true }),
		lessonNum: Type.number({ required: true }),
		oldLessonName: Type.string({ required: true }),
		oldLessonTeacher: Type.string({ required: true }),
		newLessonName: Type.string({ required: true }),
		newLessonTeacher: Type.string({ required: true }),
		hash: Type.string({ required: true, unique: true }),
	},
	{ versionKey: false },
);

const timetableScheme = createSchema(
	{
		num: Type.number({ required: true }),
		type: Type.string({ required: true }),
		start: {
			hour: Type.number({ required: true }),
			minute: Type.number({ required: true }),
		},
		end: {
			hour: Type.number({ required: true }),
			minute: Type.number({ required: true }),
		},
	},
	{ _id: false },
);

const configScheme = createSchema(
	{
		currentWeek: Type.string({ required: true }),
		timetable: Type.array({ required: true }).of(timetableScheme),
	},
	{ versionKey: false },
);

export default {
	configScheme,
	timetableScheme,
	groupSchema,
	replacementSchema,
};
