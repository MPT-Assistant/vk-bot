import moment from "moment";

import DB from "../DB";

import { ParsedTimetableElement } from "../../types/mpt";

class MPT {
	public parseTimetable(date: moment.Moment): ParsedTimetableElement[] {
		const response: ParsedTimetableElement[] = [];

		for (const element of DB.api.info.source.timetable) {
			let status: "await" | "process" | "finished";

			const startElement = moment(date);
			const endElement = moment(date);

			startElement.set("hour", element.start.hour);
			startElement.set("minute", element.start.minute);
			startElement.set("second", 0);
			startElement.set("millisecond", 0);

			endElement.set("hour", element.end.hour);
			endElement.set("minute", element.end.minute);
			endElement.set("second", 0);
			endElement.set("millisecond", 0);

			if (date > startElement && date < endElement) {
				status = "process";
			} else if (date > startElement && date > endElement) {
				status = "finished";
			} else {
				status = "await";
			}

			response.push({
				status,
				type: element.type as "lesson" | "recess",
				num: element.num,
				start: startElement,
				end: endElement,
				diffStart: moment.preciseDiff(date, startElement, true),
				diffEnd: moment.preciseDiff(date, endElement, true),
			});
		}
		return response;
	}
}

export default new MPT();
