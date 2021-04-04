import { Keyboard, KeyboardBuilder } from "vk-io";
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
		groupData: MPT_Group,
		selectedDate = moment(),
	): {
		place: string;
		lessons: {
			num: number;
			name: string;
			teacher: string;
		}[];
	} {
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
			place: string;
			lessons: {
				num: number;
				name: string;
				teacher: string;
			}[];
		} = {
			place: selectDaySchedule.place,
			lessons: [],
		};

		for (const lesson of selectDaySchedule.lessons) {
			if (lesson.name.length === 1) {
				responseLessons.lessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
				});
			} else {
				if (
					lesson.name[0] !== `-` &&
					selectedDateWeekLegend === "Знаменатель"
				) {
					responseLessons.lessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
					});
				} else if (
					lesson.name[0] !== `-` &&
					selectedDateWeekLegend === "Числитель"
				) {
					responseLessons.lessons.push({
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
		groupData: MPT_Group,
		selectedDate = moment(),
	): Replacement[] {
		return this.data.replacements.filter(
			(replacement) =>
				replacement.group.toLowerCase() === groupData.name.toLowerCase() &&
				moment(replacement.date).format("DD.MM.YYYY") ===
					selectedDate.format("DD.MM.YYYY"),
		);
	}

	public parseSchedule(
		groupData: MPT_Group,
		selectedDate = moment(),
	): {
		replacementsCount: number;
		week: Week;
		place: string;
		lessons: { num: number; name: string; teacher: string }[];
	} {
		const lessonsData = this.parseLessons(groupData, selectedDate);
		const replacements = this.parseReplacements(groupData, selectedDate);

		if (replacements.length === 0) {
			return {
				replacementsCount: 0,
				place: lessonsData.place,
				week: this.getWeekLegend(selectedDate),
				lessons: lessonsData.lessons,
			};
		} else {
			for (const replacement of replacements) {
				const currentLesson = lessonsData.lessons.find(
					(lesson) => lesson.num === replacement.lessonNum,
				);

				if (!currentLesson) {
					lessonsData.lessons.push({
						num: replacement.lessonNum,
						name: replacement.newLessonName,
						teacher: replacement.newLessonTeacher,
					});
				} else {
					currentLesson.name = replacement.newLessonName;
					currentLesson.teacher = replacement.newLessonTeacher;
				}
			}

			lessonsData.lessons.sort((firstLesson, secondLesson) => {
				if (firstLesson.num > secondLesson.num) {
					return 1;
				} else if (firstLesson.num < secondLesson.num) {
					return -1;
				} else {
					return 0;
				}
			});

			return {
				replacementsCount: replacements.length,
				place: lessonsData.place,
				week: this.getWeekLegend(selectedDate),
				lessons: lessonsData.lessons,
			};
		}
	}

	public getWeekLegend(selectedDate = moment()): Week {
		const currentWeek = moment().week();
		if ((currentWeek & 2) === (selectedDate.week() & 2)) {
			return this.data.week;
		} else {
			return this.isNumerator ? "Числитель" : "Знаменатель";
		}
	}

	public generateKeyboard(
		type: "text" | "callback",
		command: "replacements" | "lessons",
	): KeyboardBuilder {
		const DayTemplates: RegExp[] = [
			/воскресенье|вс/,
			/понедельник|пн/,
			/вторник|вт/,
			/среда|ср/,
			/четверг|чт/,
			/пятница|пт/,
			/суббота|сб/,
		];

		const getNextSelectDay = (
			day:
				| "понедельник"
				| "вторник"
				| "среда"
				| "четверг"
				| "пятница"
				| "суббота"
				| "воскресенье",
		) => {
			const selectedDay = DayTemplates.findIndex((x) => x.test(day));
			const currentDate = new Date();
			const targetDay = Number(selectedDay);
			const targetDate = new Date();
			const delta = targetDay - currentDate.getDay();
			if (delta >= 0) {
				targetDate.setDate(currentDate.getDate() + delta);
			} else {
				targetDate.setDate(currentDate.getDate() + 7 + delta);
			}
			return moment(targetDate).format("DD.MM.YYYY");
		};

		const builder = Keyboard.builder().inline();

		if (type === "text") {
			const textCommand = command
				.replace("replacements", "замены")
				.replace("lessons", "рп");

			builder.textButton({
				label: "ПН",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("понедельник"),
				},
			});
			builder.textButton({
				label: "ВТ",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("вторник"),
				},
			});
			builder.textButton({
				label: "СР",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("среда"),
				},
			});
			builder.row();
			builder.textButton({
				label: "ЧТ",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("четверг"),
				},
			});
			builder.textButton({
				label: "ПТ",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("пятница"),
				},
			});
			builder.textButton({
				label: "СБ",
				color: "secondary",
				payload: {
					command: textCommand + " " + getNextSelectDay("суббота"),
				},
			});
			builder.row();
			builder.textButton({
				label: "Вчера",
				color: "negative",
				payload: {
					command: textCommand + " вчера",
				},
			});
			builder.textButton({
				label: "Завтра",
				color: "positive",
				payload: {
					command: textCommand + " завтра",
				},
			});
		} else {
			builder.callbackButton({
				label: "ПН",
				payload: {
					type: command,
					date: getNextSelectDay("понедельник"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.callbackButton({
				label: "ВТ",
				payload: {
					type: command,
					date: getNextSelectDay("вторник"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.callbackButton({
				label: "СР",
				payload: {
					type: command,
					date: getNextSelectDay("среда"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.row();
			builder.callbackButton({
				label: "ЧТ",
				payload: {
					type: command,
					date: getNextSelectDay("четверг"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.callbackButton({
				label: "ПТ",
				payload: {
					type: command,
					date: getNextSelectDay("пятница"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.callbackButton({
				label: "СБ",
				payload: {
					type: command,
					date: getNextSelectDay("суббота"),
				},
				color: Keyboard.SECONDARY_COLOR,
			});
			builder.row();
			builder.callbackButton({
				label: "Вчера",
				payload: {
					type: command,
					date: moment().subtract(1, "day").format("DD.MM.YYYY"),
				},
				color: Keyboard.NEGATIVE_COLOR,
			});
			builder.callbackButton({
				label: "Завтра",
				payload: {
					type: command,
					date: moment().add(1, "day").format("DD.MM.YYYY"),
				},
				color: Keyboard.POSITIVE_COLOR,
			});
		}

		return builder;
	}
}
