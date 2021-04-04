import { Keyboard } from "vk-io";
import moment from "moment";
import utils from "rus-anonym-utils";

import EventCommand from "../../../lib/utils/classes/eventCommand";
import InternalUtils from "../../../lib/utils/classes/utils";
import vk from "../../../lib/vk";

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

new EventCommand("replacements", async function SetGroupEventCommand(event) {
	const selectedDate = moment(event.eventPayload.date, "DD.MM.YYYY");

	if (!selectedDate.isValid()) {
		return await event.answer({
			type: "show_snackbar",
			text: `Неверная дата ${event.eventPayload.date}`,
		});
	}
	if (
		(event.chat &&
			event.chat.data.group === "" &&
			event.user.data.group === "") ||
		(event.user.data.group === "" && !event.chat)
	) {
		return await event.answer({
			type: "show_snackbar",
			text: `Вы не установили свою группу.`,
		});
	}

	let userGroup: string | undefined;

	if (event.user.data.group === "" && event.chat) {
		userGroup = event.chat?.data.group;
	} else {
		userGroup = event.user.data.group;
	}

	const groupData = InternalUtils.mpt.data.groups.find(
		(x) => x.name === userGroup,
	);

	if (!groupData) {
		throw new Error("Group not found");
	}

	const selectDayReplacements = InternalUtils.mpt.data.replacements.filter(
		(replacement) =>
			replacement.group.toLowerCase() === groupData.name.toLowerCase() &&
			moment(replacement.date).format("DD.MM.YYYY") ===
				selectedDate.format("DD.MM.YYYY"),
	);

	if (selectDayReplacements.length === 0) {
		return await event.answer({
			type: "show_snackbar",
			text: `На выбранный день ${selectedDate.format(
				"DD.MM.YYYY",
			)} замен не найдено.`,
		});
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

		vk.api.messages
			.edit({
				peer_id: event.peerId,
				conversation_message_id: event.conversationMessageId,
				dont_parse_links: true,
				keyboard: generateKeyboard(),
				keep_forward_messages: true,
				keep_snippets: true,
				message: `@id${event.user.id} (${
					event.user.data.nickname
				}) на выбранный день ${selectedDate.format("DD.MM.YYYY")} для группы ${
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
			})
			.then(() => {
				event.answer({
					type: "show_snackbar",
					text: `Сообщение обновлено.`,
				});
			});
	}
});
