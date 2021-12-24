import { Moment, PreciseRangeValueObject } from "moment";

interface ParsedTimetableElement {
	status: "await" | "process" | "finished";
	num: number;
	type: "lesson" | "recess";
	start: Moment;
	end: Moment;
	diffStart: PreciseRangeValueObject;
	diffEnd: PreciseRangeValueObject;
}

export { ParsedTimetableElement };
