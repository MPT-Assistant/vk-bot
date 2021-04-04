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
	Day,
	Group,
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

	get isDenominator(): boolean {
		return this.data.week === "Знаменатель";
	}

	get isNumerator(): boolean {
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

	public parseLessons(
		group: string,
		selectedDate = moment(),
	): {
		num: number;
		name: string;
		teacher: string;
	}[] {
		const groupData = this.data.groups.find(
			(x) => x.name === group,
		) as MPT_Group;

		const selectSpecialty = this.data.schedule.find(
			(specialty) => specialty.name === groupData.specialty,
		) as Specialty;

		const selectGroup = selectSpecialty.groups.find(
			(group) => group.name === groupData.name,
		) as Group;

		const selectedDayNum = selectedDate.day();
		const selectedDateWeekLegend = this.getWeekLegend(selectedDate);

		const selectDaySchedule = selectGroup.days.find(
			(day) => day.num === selectedDayNum,
		) as Day;

		const responseLessons: {
			num: number;
			name: string;
			teacher: string;
		}[] = [];

		for (const lesson of selectDaySchedule.lessons) {
			if (lesson.name.length === 1) {
				responseLessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
				});
			} else {
				if (
					lesson.name[0] !== `-` &&
					selectedDateWeekLegend === "Знаменатель"
				) {
					responseLessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
					});
				} else if (
					lesson.name[0] !== `-` &&
					selectedDateWeekLegend === "Числитель"
				) {
					responseLessons.push({
						num: lesson.num,
						name: lesson.name[1] as string,
						teacher: lesson.teacher[1] as string,
					});
				}
			}
		}

		return responseLessons;
	}

	public parseReplacements(
		group: string,
		selectedDate = moment(),
	): Replacement[] {
		return this.data.replacements.filter(
			(replacement) =>
				replacement.group.toLowerCase() === group.toLowerCase() &&
				moment(replacement.date).format("DD.MM.YYYY") ===
					selectedDate.format("DD.MM.YYYY"),
		);
	}

	public parseSchedule(
		group: string,
		selectedDate = moment(),
	): { num: number; name: string; teacher: string }[] {
		const lessons = this.parseLessons(group, selectedDate);
		const replacements = this.parseReplacements(group, selectedDate);

		if (replacements.length === 0) {
			return lessons;
		} else {
			for (const replacement of replacements) {
				const currentLesson = lessons.find(
					(lesson) => lesson.num === replacement.lessonNum,
				);

				if (!currentLesson) {
					lessons.push({
						num: replacement.lessonNum,
						name: replacement.newLessonName,
						teacher: replacement.newLessonTeacher,
					});
				} else {
					currentLesson.name = replacement.newLessonName;
					currentLesson.teacher = replacement.newLessonTeacher;
				}
			}

			lessons.sort((firstLesson, secondLesson) => {
				if (firstLesson.num > secondLesson.num) {
					return 1;
				} else if (firstLesson.num < secondLesson.num) {
					return -1;
				} else {
					return 0;
				}
			});

			return lessons;
		}
	}

	public getWeekLegend = (selectedDate = moment()): Week => {
		const currentWeek = moment().week();
		if ((currentWeek & 2) === (selectedDate.week() & 2)) {
			return this.data.week;
		} else {
			return this.isNumerator ? "Числитель" : "Знаменатель";
		}
	};
}
