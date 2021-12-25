import moment from "moment";
import utils from "rus-anonym-utils";

import EventCommand from "../../../utils/EventCommand";
import DB from "../../../DB";
import VK from "../../../VK";
import internalUtils from "../../../utils";

new EventCommand({
	event: "replacements",
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

		const selectDayReplacements = await DB.api.models.replacement.find({
			group: groupData.name,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

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

			VK.api.messages
				.edit({
					peer_id: event.peerId,
					conversation_message_id: event.conversationMessageId,
					dont_parse_links: true,
					keyboard: internalUtils.mpt.generateKeyboard(
						"callback",
						"replacements",
					),
					keep_forward_messages: true,
					keep_snippets: true,
					message: `@id${event.state.user.id} (${
						event.state.user.nickname
					}) на выбранный день ${selectedDate.format(
						"DD.MM.YYYY",
					)} для группы ${groupData.name} ${utils.string.declOfNum(
						selectDayReplacements.length,
						["найдена", "найдено", "найдено"],
					)} ${selectDayReplacements.length} ${utils.string.declOfNum(
						selectDayReplacements.length,
						["замена", "замены", "замен"],
					)}:\n\n${responseReplacementsText}`,
				})
				.then(() => {
					event.answer({
						type: "show_snackbar",
						text: `Сообщение обновлено.`,
					});
				});
		}
	},
});
