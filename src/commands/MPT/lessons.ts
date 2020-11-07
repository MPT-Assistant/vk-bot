import { timetableElement } from "./../../plugins/types";
import utils from "rus-anonym-utils";
import { MPTMessage } from "../../plugins/types";
import { Keyboard } from "vk-io";

import models from "../../plugins/models";
import { mpt } from "../../plugins/mpt";

declare global {
	interface Date {
		getWeek: () => number;
	}
}

export = {
	regexp: /^(?:расписание|рп|какие пары|какие пары|пары|уроки|lessons|pairs|pair)\s?([^]+)?/i,
	template: ["расписание", "рп"],
	process: async (message: MPTMessage) => {
		if (
			(message.chat &&
				message.chat.unical_group_id === "" &&
				message.user.data.unical_group_id === "") ||
			(message.user.data.unical_group_id === "" && !message.isChat)
		) {
			return await message.sendMessage(
				`Вы не установили свою группу. Для установки своей группы введите команду: "Установить группу [Название группы]", либо же для установки стандартной группы для чата: "regchat [Название группы].`,
			);
		}
		let groupData: any;
		if (message.user.data.unical_group_id === "" && message.chat) {
			groupData = await models.utilityGroup.findOne({
				uid: message.chat.unical_group_id,
			});
		} else {
			groupData = await models.utilityGroup.findOne({
				uid: message.user.data.unical_group_id,
			});
		}
		let selectedDate: any;
		let arrayWithDays: any = [
			{
				template: `понедельник`,
				day: 1,
			},
			{
				template: `пн`,
				day: 1,
			},
			{
				template: `вторник`,
				day: 2,
			},
			,
			{
				template: `вт`,
				day: 2,
			},
			,
			{
				template: `среда`,
				day: 3,
			},
			,
			{
				template: `ср`,
				day: 3,
			},
			,
			{
				template: `четверг`,
				day: 4,
			},
			,
			{
				template: `чт`,
				day: 4,
			},
			,
			{
				template: `пятница`,
				day: 5,
			},
			,
			{
				template: `пт`,
				day: 5,
			},
			,
			{
				template: `суббота`,
				day: 6,
			},
			,
			{
				template: `сб`,
				day: 6,
			},
			,
			{
				template: `воскресенье`,
				day: 0,
			},
			,
			{
				template: `вс`,
				day: 0,
			},
		];
		if (
			!message.args[1] ||
			/(?:^сегодня|с)$/gi.test(message.args[1]) === true
		) {
			selectedDate = new Date().getTime();
		} else if (/(?:^завтра|^з)$/gi.test(message.args[1]) === true) {
			selectedDate = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
		} else if (/(?:^послезавтра|^пз)$/gi.test(message.args[1]) === true) {
			selectedDate = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
		} else if (/(?:^вчера|^в)$/gi.test(message.args[1]) === true) {
			selectedDate = new Date().getTime() - 1 * 24 * 60 * 60 * 1000;
		} else if (/(?:^позавчера|^поз)$/gi.test(message.args[1]) === true) {
			selectedDate = new Date().getTime() - 2 * 24 * 60 * 60 * 1000;
		} else if (
			/([0-9]+)?(.)?([0-9]+)?(.)?([0-9]+)/.test(message.args[1]) === true
		) {
			let data = message.args[1].split(`.`);
			let currentDate = utils.time.currentDate();
			if (!data[1]) {
				data[1] = currentDate.split(`.`)[1];
			}
			if (!data[2]) {
				data[2] = currentDate.split(`.`)[2];
			}
			data[0] = Number(data[0]);
			data[1] = Number(data[1]);
			data[2] = Number(data[2]);
			if (data[0] < 10) {
				data[0] = `0${data[0]}`;
			}
			if (data[1] < 10) {
				data[1] = `0${data[1]}`;
			}
			try {
				let tempDate = new Date(`${data[2]}-${data[1]}-${data[0]}T15:00:00`);
				selectedDate = tempDate.getTime();
			} catch (error) {
				return await message.sendMessage(`неверная дата.`);
			}
		} else {
			for (let i in arrayWithDays) {
				let Regular_Expression = new RegExp(arrayWithDays[i].template, `gi`);
				if (Regular_Expression.test(message.args[1]) === true) {
					let date = new Date(),
						targetDay = arrayWithDays[i].day,
						targetDate = new Date(),
						delta = targetDay - date.getDay();
					if (delta >= 0) {
						targetDate.setDate(date.getDate() + delta);
					} else {
						targetDate.setDate(date.getDate() + 7 + delta);
					}
					selectedDate = Number(targetDate);
				}
			}
		}

		if (!selectedDate) {
			return await message.sendMessage(`неверная дата.`);
		}

		let keyboardData = [
			[
				Keyboard.textButton({
					label: "ПН",
					payload: {
						command: `Рп понедельник`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "ВТ",
					payload: {
						command: `Рп вторник`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "СР",
					payload: {
						command: `Рп Среда`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			],
			[
				Keyboard.textButton({
					label: "ЧТ",
					payload: {
						command: `Рп четверг`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "ПТ",
					payload: {
						command: `Рп пятница`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "СБ",
					payload: {
						command: `Рп суббота`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			],
			[
				Keyboard.textButton({
					label: "Вчера",
					payload: {
						command: `Рп вчера`,
					},
					color: Keyboard.NEGATIVE_COLOR,
				}),
				Keyboard.textButton({
					label: "Сегодня",
					payload: {
						command: `Рп сегодня`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "Завтра",
					payload: {
						command: `Рп завтра`,
					},
					color: Keyboard.POSITIVE_COLOR,
				}),
			],
		];

		if (new Date(selectedDate).getDay() === 0) {
			return await message.sendMessage(
				`${utils.time.getDateByMS(selectedDate)} воскресенье.`,
				{ keyboard: Keyboard.keyboard(keyboardData).inline() },
			);
		}

		Date.prototype.getWeek = function (): any {
			let date = new Date(this.getTime());
			date.setHours(0, 0, 0, 0);
			date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
			let week = new Date(date.getFullYear(), 0, 4);
			return (
				1 +
				Math.round(
					((date.getTime() - week.getTime()) / 86400000 -
						3 +
						((week.getDay() + 6) % 7)) /
						7,
				)
			);
		};
		let lessonsString = ``;
		let selectedWeekString;
		let arrayWithLessons: any = [];
		let replacementKeyboard = [];
		let userSpecialty: any = await models.specialty.findOne({
			uid: groupData.specialty_id,
		});

		let userGroup = await userSpecialty.groups.find(
			(x: any) => x.uid === groupData.uid,
		);

		let selectedDay = await userGroup.weekly_schedule.find(
			(x: any) => x.num === new Date(selectedDate).getDay(),
		);

		let timetable = await mpt.parseTimetable();
		if (
			//@ts-ignore
			timetable.find(
				(x: timetableElement) =>
					x.num === selectedDay.lessons[selectedDay.lessons.length - 1].num &&
					x.lesson === true,
			).status === `finished` &&
			!message.args[1]
		) {
			if (new Date(selectedDate).getDay() + 1 === 7) {
				selectedDay = await userGroup.weekly_schedule.find(
					(x: any) => x.num === 1,
				);
				selectedDate = Number(
					new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 2),
				);
			} else {
				selectedDay = await userGroup.weekly_schedule.find(
					(x: any) => x.num === new Date(selectedDate).getDay() + 1,
				);
				selectedDate = Number(
					new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1),
				);
			}
		}

		let numerator = Number.isInteger(new Date(selectedDate).getWeek() / 2);

		if (numerator === true) {
			selectedWeekString = `Числитель`;
		} else {
			selectedWeekString = `Знаменатель`;
		}

		for (let i in selectedDay.lessons) {
			if (selectedDay.lessons[i].name.length === 1) {
				arrayWithLessons.push({
					lesson_num: selectedDay.lessons[i].num,
					lesson_name: selectedDay.lessons[i].name[0],
					lesson_teacher: selectedDay.lessons[i].teacher[0],
				});
			} else {
				if (selectedDay.lessons[i].name[0] != `-` && numerator === true) {
					arrayWithLessons.push({
						lesson_num: selectedDay.lessons[i].num,
						lesson_name: selectedDay.lessons[i].name[0],
						lesson_teacher: selectedDay.lessons[i].teacher[0],
					});
				} else if (
					selectedDay.lessons[i].name[1] != `-` &&
					numerator === false
				) {
					arrayWithLessons.push({
						lesson_num: selectedDay.lessons[i].num,
						lesson_name: selectedDay.lessons[i].name[1],
						lesson_teacher: selectedDay.lessons[i].teacher[1],
					});
				}
			}
		}

		let replacementChecker = await models.replacement.exists({
			date: utils.time.getDateByMS(Number(selectedDate)),
			unical_group_id: groupData.uid,
		});

		function sorter(a: any, b: any) {
			if (a.lesson_num > b.lesson_num) return 1;
			if (a.lesson_num < b.lesson_num) return -1;
			return 0;
		}

		if (replacementChecker === true) {
			let replacementOnThisDayData: any = await models.replacement.find({
				date: utils.time.getDateByMS(Number(selectedDate)),
				unical_group_id: groupData.uid,
			});

			for (let i in replacementOnThisDayData) {
				let check_lesson = arrayWithLessons.find(
					(x: any) => x.lesson_num === replacementOnThisDayData[i].lesson_num,
				);
				if (!check_lesson) {
					arrayWithLessons.push({
						lesson_num: replacementOnThisDayData[i].lesson_num,
						lesson_name: replacementOnThisDayData[i].new_lesson_name,
						lesson_teacher: replacementOnThisDayData[i].new_lesson_teacher,
					});
				} else {
					check_lesson.lesson_name =
						replacementOnThisDayData[i].new_lesson_name;
					check_lesson.lesson_teacher =
						replacementOnThisDayData[i].new_lesson_teacher;
				}
			}
			arrayWithLessons.sort(sorter);
			for (let i in arrayWithLessons) {
				let lessonTimetableData = timetable.find(
					(x: timetableElement) =>
						x.num === Number(arrayWithLessons[i].lesson_num) &&
						x.lesson === true,
				);
				lessonsString += `\n${arrayWithLessons[i].lesson_num}. ${
					arrayWithLessons[i].lesson_name
				}\n(${arrayWithLessons[i].lesson_teacher})\n${
					lessonTimetableData
						? utils.time
								.getTimeByMS(Number(lessonTimetableData?.start))
								.slice(0, -3) +
						  " - " +
						  utils.time
								.getTimeByMS(Number(lessonTimetableData?.end))
								.slice(0, -3)
						: ""
				}\n`;
			}
			lessonsString += `\n\nВнимание:\nНа выбранный день есть замена.\nПросмотреть текущие замены можно командой "замены".`;
			replacementKeyboard = [
				Keyboard.textButton({
					label: `Замены`,
					payload: {
						command: `Замены ${utils.time.getDateByMS(selectedDate)}`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			];
			keyboardData.push(replacementKeyboard);
		} else {
			for (let i in arrayWithLessons) {
				let lessonTimetableData = timetable.find(
					(x: timetableElement) =>
						x.num === Number(arrayWithLessons[i].lesson_num) &&
						x.lesson === true,
				);
				lessonsString += `\n${arrayWithLessons[i].lesson_num}. ${
					arrayWithLessons[i].lesson_name
				}\n(${arrayWithLessons[i].lesson_teacher})\n${
					lessonTimetableData
						? utils.time
								.getTimeByMS(Number(lessonTimetableData?.start))
								.slice(0, -3) +
						  " - " +
						  utils.time
								.getTimeByMS(Number(lessonTimetableData?.end))
								.slice(0, -3)
						: ""
				}\n`;
			}
		}

		function getWeekDay(date: any) {
			let days = [
				"Воскресенье",
				"Понедельник",
				"Вторник",
				"Среда",
				"Четверг",
				"Пятница",
				"Суббота",
			];
			return days[date.getDay()];
		}

		return message.sendMessage(
			`расписание на ${utils.time.getDateByMS(selectedDate)}:
Группа: ${groupData.name}
День: ${getWeekDay(new Date(selectedDate))}
Место: ${selectedDay.place}
Неделя: ${selectedWeekString} (${new Date(selectedDate).getWeek()})
${lessonsString}`,
			{ keyboard: Keyboard.keyboard(keyboardData).inline() },
		);
	},
};
