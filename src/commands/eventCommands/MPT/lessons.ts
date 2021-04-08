import moment from "moment";

import EventCommand from "../../../lib/utils/classes/eventCommand";
import InternalUtils from "../../../lib/utils/classes/utils";
import vk from "../../../lib/vk";

new EventCommand("lessons", async function SetGroupEventCommand(event) {
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
			text: "Вы не установили свою группу.",
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

	const responseKeyboard = InternalUtils.mpt.generateKeyboard(
		"callback",
		"lessons",
	);

	if (selectedDate.day() === 0) {
		return await event.answer({
			type: "show_snackbar",
			text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
		});
	}

	const parsedTimetable = InternalUtils.mpt.parseTimetable(selectedDate);
	const parsedSchedule = InternalUtils.mpt.parseSchedule(
		groupData,
		selectedDate,
	);

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

	vk.api.messages
		.edit({
			peer_id: event.peerId,
			conversation_message_id: event.conversationMessageId,
			dont_parse_links: true,
			keyboard: responseKeyboard,
			keep_forward_messages: true,
			keep_snippets: true,
			message: `@id${event.user.id} (${
				event.user.data.nickname
			}), расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${parsedSchedule.place}
Неделя: ${parsedSchedule.week}

${responseLessonsText}

${
	parsedSchedule.replacementsCount > 0
		? `\nВнимание:\nНа выбранный день есть замена.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`,
		})
		.then(() => {
			event.answer({
				type: "show_snackbar",
				text: `Сообщение обновлено.`,
			});
		});
});
