import { Moment, PreciseRangeValueObject } from "moment";

type Week = "Числитель" | "Знаменатель";

interface Lesson {
	num: number;
	name: string;
	teacher: string;
}

interface ParsedTimetableElement {
	status: "await" | "process" | "finished";
	num: number;
	type: "lesson" | "recess";
	start: Moment;
	end: Moment;
	diffStart: PreciseRangeValueObject;
	diffEnd: PreciseRangeValueObject;
}

export { ParsedTimetableElement, Week, Lesson };
