import { Keyboard } from "vk-io";
import moment from "moment";
import utils from "rus-anonym-utils";

moment.locale("ru");

import TextCommand from "../../../lib/utils/classes/textCommand";
import InternalUtils from "../../../lib/utils/classes/utils";
import { Day, Specialty, Group } from "../../../typings/mpt";

const DayTemplates: RegExp[] = [
	/воскресенье|вс/,
	/понедельник|пн/,
	/вторник|вт/,
	/среда|ср/,
	/четверг|чт/,
	/пятница|пт/,
	/суббота|сб/,
];

new TextCommand(
	/^(?:расписание|рп|какие пары)(?:\s(.+))?$/i,
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
			case /([\d]+)?(.)?([\d]+)?(.)?([\d]+)/.test(message.args[1]): {
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
			}
			default:
				for (const i in DayTemplates) {
					const Regular_Expression = new RegExp(DayTemplates[i], `gi`);
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

		const responseKeyboard = InternalUtils.mpt.generateKeyboard(
			"callback",
			"lessons",
		);

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

		const selectGroup = selectSpecialty.groups.find(
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

		const parsedSchedule = InternalUtils.mpt.parseSchedule(
			groupData,
			selectedDate,
		);

		if (parsedSchedule.replacementsCount !== 0) {
			responseKeyboard.row();
			responseKeyboard.callbackButton({
				label: "Замены",
				payload: {
					type: "replacements",
					date: selectedDate.format("DD.MM.YYYY"),
				},
				color: Keyboard.PRIMARY_COLOR,
			});
		}

		let responseLessonsText = "";

		for (const lesson of parsedSchedule.lessons) {
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
			`расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${parsedSchedule.place}
Неделя: ${parsedSchedule.week}

${responseLessonsText}

${
	parsedSchedule.replacementsCount > 0
		? `\nВнимание:\nНа выбранный день есть ${utils.string.declOfNum(
				parsedSchedule.replacementsCount,
				["замена", "замены", "замены"],
		  )}.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`,
			{ keyboard: responseKeyboard },
		);
	},
);
