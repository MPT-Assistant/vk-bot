import { Keyboard } from "vk-io";
import moment from "moment";

moment.locale("ru");

import TextCommand from "../../../lib/utils/classes/textCommand";
import InternalUtils from "../../../lib/utils/classes/utils";
import { Week, Day, Specialty, Group } from "../../../typings/mpt";

const DayTemplates: RegExp[] = [
	/воскресенье|вс/,
	/понедельник|пн/,
	/вторник|вт/,
	/среда|ср/,
	/четверг|чт/,
	/пятница|пт/,
	/суббота|сб/,
];

const generateKeyboard = () => {
	const responseKeyboard = Keyboard.builder();
	responseKeyboard.textButton({
		label: "ПН",
		payload: {
			command: `Рп понедельник`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.textButton({
		label: "ВТ",
		payload: {
			command: `Рп вторник`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.textButton({
		label: "СР",
		payload: {
			command: `Рп Среда`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.row();
	responseKeyboard.textButton({
		label: "ЧТ",
		payload: {
			command: `Рп четверг`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.textButton({
		label: "ПТ",
		payload: {
			command: `Рп пятница`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.textButton({
		label: "СБ",
		payload: {
			command: `Рп суббота`,
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.row();
	responseKeyboard.textButton({
		label: "Вчера",
		payload: {
			command: `Рп вчера`,
		},
		color: Keyboard.NEGATIVE_COLOR,
	});
	responseKeyboard.textButton({
		label: "Завтра",
		payload: {
			command: `Рп завтра`,
		},
		color: Keyboard.POSITIVE_COLOR,
	});
	responseKeyboard.inline();
	return responseKeyboard;
};

const getWeekLegend = (week: number): Week => {
	const currentWeek = moment().week();
	if ((currentWeek & 2) === (week & 2)) {
		return InternalUtils.mpt.data.week;
	} else {
		return InternalUtils.mpt.isNumerator ? "Числитель" : "Знаменатель";
	}
};

new TextCommand(
	/^(?:расписание|рп|какие пары)(?:\s(.+))?/i,
	["Расписание", "Рп"],
	async function LessonsCommand(message) {
		if (
			(message.chat &&
				message.chat.data.group === "" &&
				message.user.data.group === "") ||
			(message.user.data.group === "" && !message.isChat)
		) {
			return await message.sendMessage(
				`Вы не установили свою группу. Для установки своей группы введите команду: "Установить группу [Название группы]", либо же для установки стандартной группы для чата: "regchat [Название группы].`,
			);
		}

		let userGroup: string | undefined;
		let selectedDate: moment.Moment | undefined;

		if (message.user.data.group === "" && message.isChat) {
			userGroup = message.chat?.data.group;
		} else {
			userGroup = message.user.data.group;
		}

		const groupData = InternalUtils.mpt.data.groups.find(
			(x) => x.name === userGroup,
		);

		if (!groupData) {
			throw new Error("Group not found");
		}

		// https://vk.com/sticker/1-1932-512
		switch (true) {
			case !message.args[1] || /(?:^сегодня|с)$/gi.test(message.args[1]):
				selectedDate = moment();
				break;
			case /(?:^завтра|^з)$/gi.test(message.args[1]):
				selectedDate = moment().add(1, "day");
				break;
			case /(?:^послезавтра|^пз)$/gi.test(message.args[1]):
				selectedDate = moment().add(2, "day");
				break;
			case /(?:^вчера|^в)$/gi.test(message.args[1]):
				selectedDate = moment().subtract(1, "day");
				break;
			case /(?:^позавчера|^поз)$/gi.test(message.args[1]):
				selectedDate = moment().subtract(2, "day");
				break;
			case /([\d]+)?(.)?([\d]+)?(.)?([\d]+)/.test(message.args[1]):
				const splittedMessageArgument = message.args[1].split(".");
				const currentSplittedDate = moment().format("DD.MM.YYYY");
				splittedMessageArgument[0] =
					splittedMessageArgument[0] || currentSplittedDate[0];
				splittedMessageArgument[1] =
					splittedMessageArgument[1] || currentSplittedDate[1];
				splittedMessageArgument[2] =
					splittedMessageArgument[2] || currentSplittedDate[2];
				selectedDate = moment(splittedMessageArgument.reverse().join("-"));
				break;
			default:
				for (let i in DayTemplates) {
					let Regular_Expression = new RegExp(DayTemplates[i], `gi`);
					if (Regular_Expression.test(message.args[1]) === true) {
						const currentDate = new Date();
						const targetDay = Number(i);
						const targetDate = new Date();
						const delta = targetDay - currentDate.getDay();
						if (delta >= 0) {
							targetDate.setDate(currentDate.getDate() + delta);
						} else {
							targetDate.setDate(currentDate.getDate() + 7 + delta);
						}
						selectedDate = moment(targetDate);
					}
				}
				break;
		}

		const responseKeyboard = generateKeyboard();

		if (!selectedDate || !selectedDate.isValid()) {
			return await message.sendMessage(`неверная дата.`, {
				keyboard: responseKeyboard,
			});
		}

		if (selectedDate.day() === 0) {
			return await message.sendMessage(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ keyboard: responseKeyboard },
			);
		}

		const parsedTimetable = InternalUtils.mpt.parseTimetable(selectedDate);

		const selectSpecialty = InternalUtils.mpt.data.schedule.find(
			(specialty) => specialty.name === groupData.specialty,
		) as Specialty;

		const selectGroup = selectSpecialty?.groups.find(
			(group) => group.name === groupData.name,
		) as Group;

		if (!message.args[1]) {
			const selectedDayNum = selectedDate.day();
			const selectDaySchedule = selectGroup.days.find(
				(day) => day.num === selectedDayNum,
			) as Day;

			const lastLessonNum =
				selectDaySchedule.lessons[selectDaySchedule.lessons.length - 1].num;

			if (
				parsedTimetable.find(
					(x) => x.num === lastLessonNum && x.type === "lesson",
				)?.status === "finished"
			) {
				if (selectedDayNum + 1 === 7) {
					selectedDate.add(2, "day");
				} else {
					selectedDate.add(1, "day");
				}
			}
		}

		const selectedDayNum = selectedDate.day();
		const selectedDateString = selectedDate.format("DD.MM.YYYY");
		const selectedDateWeekLegend = getWeekLegend(selectedDate.week());

		const selectDaySchedule = selectGroup.days.find(
			(day) => day.num === selectedDayNum,
		) as Day;

		const selectDayReplacements = InternalUtils.mpt.data.replacements.filter(
			(replacement) =>
				moment(replacement.date).format("DD.MM.YYYY") === selectedDateString &&
				replacement.group.toLowerCase() === groupData.name.toLowerCase(),
		);

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

		if (selectDayReplacements.length > 0) {
			for (const replacement of selectDayReplacements) {
				const currentLesson = responseLessons.find(
					(lesson) => lesson.num === replacement.lessonNum,
				);

				if (!currentLesson) {
					responseLessons.push({
						num: replacement.lessonNum,
						name: replacement.newLessonName,
						teacher: replacement.newLessonTeacher,
					});
				} else {
					currentLesson.name = replacement.newLessonName;
					currentLesson.teacher = replacement.newLessonTeacher;
				}
			}

			responseKeyboard.row();
			responseKeyboard.textButton({
				label: "Замены",
				payload: {
					command: `замены на ${selectedDateString}`,
				},
				color: Keyboard.PRIMARY_COLOR,
			});
		}

		responseLessons.sort((firstLesson, secondLesson) => {
			if (firstLesson.num > secondLesson.num) {
				return 1;
			} else if (firstLesson.num < secondLesson.num) {
				return -1;
			} else {
				return 0;
			}
		});

		let responseLessonsText = "";

		for (const lesson of responseLessons) {
			const lessonDateData = parsedTimetable.find(
				(x) => x.num === lesson.num && x.type === "lesson",
			);
			responseLessonsText += `${
				lessonDateData
					? lessonDateData.start.format("HH:mm:ss") +
					  " - " +
					  lessonDateData.end.format("HH:mm:ss")
					: ""
			}\n${lesson.num}. ${lesson.name} (${lesson.teacher})\n\n`;
		}

		const selectedDayName = selectedDate.format("dddd").split("");
		selectedDayName[0] = selectedDayName[0].toUpperCase();

		return await message.sendMessage(
			`расписание на ${selectedDateString}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${selectDaySchedule.place}
Неделя: ${selectedDateWeekLegend}

${responseLessonsText}

${
	selectDayReplacements.length > 0
		? `\nВнимание:\nНа выбранный день есть замена.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`,
			{ keyboard: responseKeyboard },
		);
	},
);
