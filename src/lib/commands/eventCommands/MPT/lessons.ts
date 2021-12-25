import moment from "moment";

import EventCommand from "../../../utils/EventCommand";
import DB from "../../../DB";
import VK from "../../../VK";
import internalUtils from "../../../utils";

new EventCommand({
	event: "lessons",
	process: async (event) => {
		const selectedDate = moment(event.eventPayload.date, "DD.MM.YYYY");

		if (!selectedDate.isValid()) {
			return await event.answer({
				type: "show_snackbar",
				text: `Неверная дата ${event.eventPayload.date}`,
			});
		}

		const groupName =
			event.state.user.group ||
			(event.state.chat ? event.state.chat?.group : "");

		if (groupName === "") {
			return await event.answer({
				type: "show_snackbar",
				text: "Вы не установили свою группу.",
			});
		}

		const groupData = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!groupData) {
			throw new Error("Group not found");
		}

		const responseKeyboard = internalUtils.mpt.generateKeyboard(
			"callback",
			"lessons",
		);

		if (selectedDate.day() === 0) {
			return await event.answer({
				type: "show_snackbar",
				text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
			});
		}

		const parsedTimetable = internalUtils.mpt.parseTimetable(selectedDate);
		const parsedSchedule = await internalUtils.mpt.getGroupSchedule(
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

		VK.api.messages
			.edit({
				peer_id: event.peerId,
				conversation_message_id: event.conversationMessageId,
				dont_parse_links: true,
				keyboard: responseKeyboard,
				keep_forward_messages: true,
				keep_snippets: true,
				message: `@id${event.state.user.id} (${
					event.state.user.nickname
				}), расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${parsedSchedule.schedule.place}
Неделя: ${parsedSchedule.week}

${responseLessonsText}
${
	parsedSchedule.replacements.length > 0
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
	},
});
