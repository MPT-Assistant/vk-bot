import moment from "moment";
import utils from "rus-anonym-utils";
import { Keyboard } from "vk-io";

moment.locale("ru");

import TextCommand from "../../../utils/TextCommand";

import DB from "../../../DB";
import internalUtils from "../../../utils";

new TextCommand({
	alias: /^(?:расписание|рп|какие пары)(?:\s(.+))?$/i,
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
			"lessons",
		);

		if (!selectedDate || !selectedDate.isValid()) {
			console.log(selectedDate);
			return await context.state.sendMessage(`неверная дата.`, {
				keyboard: responseKeyboard,
			});
		}

		if (selectedDate.day() === 0 && !context.state.args[1]) {
			selectedDate.add(1, "day");
		} else if (selectedDate.day() === 0 && context.state.args[1]) {
			return await context.state.sendMessage(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ keyboard: responseKeyboard },
			);
		}

		const parsedTimetable = internalUtils.mpt.parseTimetable(selectedDate);

		if (!context.state.args[1]) {
			const selectedDayNum = selectedDate.day();
			const selectedDaySchedule = groupData.schedule.find(
				(day) => day.num === selectedDayNum,
			);

			if (selectedDaySchedule?.lessons.length === 0) {
				return await context.state.sendMessage(
					`на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
						groupData.name
					} не найдено`,
					{ keyboard: responseKeyboard },
				);
			}
			const lastLessonNum = selectedDaySchedule?.lessons.slice(-1)[0].num;

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

		const scheduleOnDay = await internalUtils.mpt.getGroupSchedule(
			groupData,
			selectedDate,
		);

		if (scheduleOnDay.replacements.length !== 0) {
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

		for (const lesson of scheduleOnDay.lessons) {
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

		if (scheduleOnDay.lessons.length === 0) {
			return await context.state.sendMessage(
				`на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
					groupData.name
				} не найдено`,
				{ keyboard: responseKeyboard },
			);
		}

		return await context.state.sendMessage(
			`расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${scheduleOnDay.schedule.place}
Неделя: ${scheduleOnDay.week}

${responseLessonsText}
${
	scheduleOnDay.replacements.length !== 0
		? `\nВнимание:\nНа выбранный день есть ${utils.string.declOfNum(
				scheduleOnDay.replacements.length,
				["замена", "замены", "замены"],
		  )}.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`,
			{ keyboard: responseKeyboard },
		);
	},
});
