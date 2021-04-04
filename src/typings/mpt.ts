import { Moment, PreciseRangeValueObject } from "moment";
type Week = "Знаменатель" | "Числитель" | "Не определено";

interface Lesson {
	num: number;
	name: [string, string?];
	teacher: [string, string?];
}

interface Day {
	num: number;
	place: string;
	name: string;
	lessons: Lesson[];
}

interface Group {
	name: string;
	days: Day[];
}

interface Specialty {
	name: string;
	groups: Group[];
}

type Replacement = {
	date: Date;
	group: string;
	detected: Date;
	addToSite: Date;
	lessonNum: number;
	oldLessonName: string;
	oldLessonTeacher: string;
	newLessonName: string;
	newLessonTeacher: string;
	hash: string;
};

interface MPT_Group {
	name: string;
	specialty: string;
}

interface MPT_Specialty {
	name: string;
	groups: Array<string>;
}

interface TimetableElement {
	num: number;
	type: "lesson" | "recess";
	start: {
		hour: number;
		minute: number;
	};
	end: {
		hour: number;
		minute: number;
	};
}

type TimetableType = TimetableElement[];

interface ParsedTimetableElement {
	status: "await" | "process" | "finished";
	num: number;
	type: "lesson" | "recess";
	start: Moment;
	end: Moment;
	diffStart: PreciseRangeValueObject;
	diffEnd: PreciseRangeValueObject;
}

type ParsedTimetableType = ParsedTimetableElement[];

export {
	ParsedTimetableElement,
	Day,
	Lesson,
	Group,
	Specialty,
	Week,
	Replacement,
	MPT_Group,
	MPT_Specialty,
	TimetableType,
	ParsedTimetableType,
};
