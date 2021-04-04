import { Keyboard } from "vk-io";
import moment from "moment";

import EventCommand from "../../../lib/utils/classes/eventCommand";
import InternalUtils from "../../../lib/utils/classes/utils";
import vk from "../../../lib/vk";
import { Day, Group, Specialty, Week } from "../../../typings/mpt";

const getWeekLegend = (week: number): Week => {
	const currentWeek = moment().week();
	if ((currentWeek & 2) === (week & 2)) {
		return InternalUtils.mpt.data.week;
	} else {
		return InternalUtils.mpt.isNumerator ? "Числитель" : "Знаменатель";
	}
};

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

	const selectSpecialty = InternalUtils.mpt.data.schedule.find(
		(specialty) => specialty.name === groupData.specialty,
	) as Specialty;

	const selectGroup = selectSpecialty?.groups.find(
		(group) => group.name === groupData.name,
	) as Group;

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
			if (lesson.name[0] !== `-` && selectedDateWeekLegend === "Знаменатель") {
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
		responseKeyboard.callbackButton({
			label: "Замены",
			payload: {
				type: "replacements",
				date: selectedDate.format("DD.MM.YYYY"),
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
			}), расписание на ${selectedDateString}:
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
		})
		.then(() => {
			event.answer({
				type: "show_snackbar",
				text: `Сообщение обновлено.`,
			});
		});
});
