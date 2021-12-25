import moment from "moment";
import { KeyboardBuilder, Keyboard } from "vk-io";

import DB from "../DB";

import { ParsedTimetableElement, Week, Lesson } from "../../types/mpt";

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

	public async getGroupSchedule(group: string, selectedDate: moment.Moment) {
		const groupData = await DB.api.models.group.findOne({
			name: group,
		});

		const replacements = await DB.api.models.replacement.find({
			group,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const schedule = groupData!.schedule.find(
			(day) => day.num === selectedDate.day(),
		)!;

		const week = this.getWeekLegend(selectedDate);

		const lessons: Lesson[] = [];

		for (const lesson of schedule.lessons) {
			if (lesson.name.length === 1) {
				lessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
				});
			} else {
				if (lesson.name[0] !== `-` && week === "Числитель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
					});
				} else if (lesson.name[1] !== `-` && week === "Знаменатель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[1] as string,
						teacher: lesson.teacher[1] as string,
					});
				}
			}
		}

		if (replacements.length !== 0) {
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
		}

		return {
			week,
			schedule,
			replacements,
			lessons,
		};
	}

	public getWeekLegend(selectedDate: moment.Moment): Week {
		const currentWeek = moment().week();
		if (currentWeek % 2 === selectedDate.week() % 2) {
			return DB.api.info.isDenominator ? "Знаменатель" : "Числитель";
		} else {
			return DB.api.info.isDenominator ? "Числитель" : "Знаменатель";
		}
	}
}

export default new MPT();
