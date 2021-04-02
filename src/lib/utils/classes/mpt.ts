import {
	MPT_Group,
	MPT_Specialty,
	Replacement,
	Specialty,
	Week,
	TimetableType,
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
}
