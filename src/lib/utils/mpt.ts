import moment from "moment";
import { KeyboardBuilder, Keyboard } from "vk-io";

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

export default new MPT();
