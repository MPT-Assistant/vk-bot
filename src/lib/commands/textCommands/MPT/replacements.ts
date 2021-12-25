import moment from "moment";
import utils from "rus-anonym-utils";

moment.locale("ru");

import TextCommand from "../../../utils/TextCommand";
import internalUtils from "../../../utils";
import DB from "../../../DB";

new TextCommand({
	alias: /^(?:замены на|замены)(?:\s(.+))?$/i,
	process: async (context) => {
		const groupName =
			context.state.user.group ||
			(context.state.chat ? context.state.chat?.group : "");

		if (groupName === "") {
			return await context.state.sendMessage(
				`Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
					context.isChat
						? `, либо же для установки стандартной группы для чата: "regchat [Название группы].`
						: ""
				}`,
			);
		}

		const groupData = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!groupData) {
			return await context.state.sendMessage(
				"Такой группы не найдено, попробуйте снова установить группу",
			);
		}

		const selectedDate = internalUtils.commands.getNextDate(
			context.state.args[1],
		);

		const responseKeyboard = internalUtils.mpt.generateKeyboard(
			context.clientInfo.button_actions.includes("callback")
				? "callback"
				: "text",
			"replacements",
		);

		if (!selectedDate || !selectedDate.isValid()) {
			return await context.state.sendMessage(`неверная дата.`, {
				keyboard: responseKeyboard,
			});
		}

		if (selectedDate.day() === 0) {
			return await context.state.sendMessage(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ keyboard: responseKeyboard },
			);
		}

		const selectDayReplacements = await DB.api.models.replacement.find({
			group: groupData.name,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

		if (selectDayReplacements.length === 0) {
			return await context.state.sendMessage(
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
			return await context.state.sendMessage(
				`на выбранный день ${selectedDate.format("DD.MM.YYYY")} для группы ${
					groupData.name
				} ${utils.string.declOfNum(selectDayReplacements.length, [
					"найдена",
					"найдено",
					"найдено",
				])} ${selectDayReplacements.length} ${utils.string.declOfNum(
					selectDayReplacements.length,
					["замена", "замены", "замен"],
				)}:\n\n${responseReplacementsText}`,
				{ keyboard: responseKeyboard },
			);
		}
	},
});
