import { Keyboard } from "vk-io";
import moment from "moment";
import utils from "rus-anonym-utils";

moment.locale("ru");

import TextCommand from "../../../lib/utils/classes/textCommand";
import InternalUtils from "../../../lib/utils/classes/utils";

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
	return moment(targetDate);
};

const generateKeyboard = () => {
	const responseKeyboard = Keyboard.builder().inline();
	responseKeyboard.callbackButton({
		label: "ПН",
		payload: {
			type: "replacements",
			date: getNextSelectDay("понедельник").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.callbackButton({
		label: "ВТ",
		payload: {
			type: "replacements",
			date: getNextSelectDay("вторник").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.callbackButton({
		label: "СР",
		payload: {
			type: "replacements",
			date: getNextSelectDay("среда").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.row();
	responseKeyboard.callbackButton({
		label: "ЧТ",
		payload: {
			type: "replacements",
			date: getNextSelectDay("четверг").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.callbackButton({
		label: "ПТ",
		payload: {
			type: "replacements",
			date: getNextSelectDay("пятница").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.callbackButton({
		label: "СБ",
		payload: {
			type: "replacements",
			date: getNextSelectDay("суббота").format("DD.MM.YYYY"),
		},
		color: Keyboard.SECONDARY_COLOR,
	});
	responseKeyboard.row();
	responseKeyboard.callbackButton({
		label: "Вчера",
		payload: {
			type: "replacements",
			date: moment().subtract(1, "day").format("DD.MM.YYYY"),
		},
		color: Keyboard.NEGATIVE_COLOR,
	});
	responseKeyboard.callbackButton({
		label: "Завтра",
		payload: {
			type: "replacements",
			date: moment().add(1, "day").format("DD.MM.YYYY"),
		},
		color: Keyboard.POSITIVE_COLOR,
	});
	return responseKeyboard;
};

new TextCommand(
	/^(?:замены на|замены)(?:\s(.+))?/i,
	["Замены"],
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

		const selectDayReplacements = InternalUtils.mpt.data.replacements.filter(
			(replacement) =>
				replacement.group.toLowerCase() === groupData.name.toLowerCase() &&
				moment(replacement.date).format("DD.MM.YYYY") ===
					selectedDate?.format("DD.MM.YYYY"),
		);

		if (selectDayReplacements.length === 0) {
			return await message.sendMessage(
				`на выбранный день (${selectedDate.format(
					"DD.MM.YYYY",
				)}) замен для группы ${groupData.name} не найдено.`,
				{ keyboard: responseKeyboard },
			);
		} else {
			let responseReplacementsText = "";
			for (let i = 0; i < selectDayReplacements.length; i++) {
				const replacement = selectDayReplacements[i];
				responseReplacementsText += `Замена #${Number(i) + 1}:
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
					"HH:mm:ss | DD.MM.YYYY",
				)}
Обнаружена ботом: ${moment(replacement.detected).format(
					"HH:mm:ss | DD.MM.YYYY",
				)}\n\n`;
			}
			return await message.sendMessage(
				`на выбранный день ${selectedDate.format("DD.MM.YYYY")} для группы ${
					groupData.name
				} ${utils.string.declOfNum(selectDayReplacements.length, [
					"найдена",
					"найдено",
					"найдено",
				])} ${
					selectDayReplacements.length
				} ${utils.string.declOfNum(selectDayReplacements.length, [
					"замена",
					"замены",
					"замен",
				])}:\n\n${responseReplacementsText}`,
				{ keyboard: responseKeyboard },
			);
		}
	},
);
