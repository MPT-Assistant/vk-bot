import moment from "moment";
import "moment-precise-range-plugin";

import {
	MPT_Group,
	MPT_Specialty,
	Replacement,
	Specialty,
	Week,
	TimetableType,
	ParsedTimetableType,
} from "../../../typings/mpt";
import utils from "./utils";

type MPT_Data = {
	week: Week;
	schedule: Specialty[];
	replacements: Replacement[];
	groups: MPT_Group[];
	specialties: MPT_Specialty[];
	timetable: TimetableType;
	lastUpdate: Date;
};

export default class MPT {
	public data: MPT_Data = {
		week: "Не определено",
		schedule: [],
		replacements: [],
		groups: [],
		specialties: [],
		timetable: {} as TimetableType,
		lastUpdate: new Date(),
	};

	public async getLastDump(): Promise<MPT_Data> {
		const data = await utils.API_DB.models.dump.findOne({});
		if (data) {
			this.data = data.data;
			return this.data;
		} else {
			throw new Error("Dump not found");
		}
	}

	get isDenominator() {
		return this.data.week === "Знаменатель";
	}

	get isNumerator() {
		return this.data.week === "Числитель";
	}

	public parseTimetable(date: moment.Moment): ParsedTimetableType {
		return this.data.timetable.map((element) => {
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

			return {
				status: status,
				type: element.type,
				num: element.num,
				start: startElement,
				end: endElement,
				diffStart: moment.preciseDiff(date, startElement, true),
				diffEnd: moment.preciseDiff(date, endElement, true),
			};
		});
	}
}
