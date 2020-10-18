import utils from "rus-anonym-utils";
import { MPTMessage } from "../plugins/types";
import { Keyboard } from "vk-io";

import models from "../plugins/models";
import { mpt } from "../plugins/mpt";

declare global {
	interface Date {
		getWeek: () => number;
	}
}

export = {
	regexp: /^(?:расписание|расписание|рп|какие пары|какие пары|пары|уроки|lessons|pairs|pair)\s?([^]+)?/i,
	process: async (message: MPTMessage) => {
		if (
			(message.chat &&
				message.chat.unical_group_id === 0 &&
				message.user.data.unical_group_id === 0) ||
			(message.user.data.unical_group_id === 0 && !message.isChat)
		) {
			return await message.sendMessage(
				`Вы не установили свою группу. Для установки своей группы введите команду: "Установить группу [Название группы]", либо же для установки стандартной группы для чата: "regchat [Название группы].`,
			);
		}
		let group_data: any;
		if (message.user.data.unical_group_id === 0 && message.chat) {
			group_data = await models.utilityGroup.findOne({
				uid: message.chat.unical_group_id,
			});
		} else {
			group_data = await models.utilityGroup.findOne({
				uid: message.user.data.unical_group_id,
			});
		}
		let selected_date: any;
		let array_with_days: any = [
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
		if (!message.args[1] || /(?:^сегодня)$/gi.test(message.args[1]) === true) {
			selected_date = new Date().getTime();
		} else if (/(?:^завтра|^з)$/gi.test(message.args[1]) === true) {
			selected_date = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
		} else if (/(?:^послезавтра|^пз)$/gi.test(message.args[1]) === true) {
			selected_date = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
		} else if (/(?:^вчера|^в)$/gi.test(message.args[1]) === true) {
			selected_date = new Date().getTime() - 1 * 24 * 60 * 60 * 1000;
		} else if (/(?:^позавчера|^поз)$/gi.test(message.args[1]) === true) {
			selected_date = new Date().getTime() - 2 * 24 * 60 * 60 * 1000;
		} else if (
			/([0-9]+)?(.)?([0-9]+)?(.)?([0-9]+)/.test(message.args[1]) === true
		) {
			let data = message.args[1].split(`.`);
			let currentDate = await utils.time.currentDate();
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
				let temp_date = new Date(`${data[2]}-${data[1]}-${data[0]}T15:00:00`);
				selected_date = temp_date.getTime();
			} catch (error) {
				return await message.sendMessage(`неверная дата.`);
			}
		} else {
			for (let i in array_with_days) {
				let Regular_Expression = new RegExp(array_with_days[i].template, `gi`);
				if (Regular_Expression.test(message.args[1]) === true) {
					let date = new Date(),
						targetDay = array_with_days[i].day,
						targetDate = new Date(),
						delta = targetDay - date.getDay();
					if (delta >= 0) {
						targetDate.setDate(date.getDate() + delta);
					} else {
						targetDate.setDate(date.getDate() + 7 + delta);
					}
					selected_date = Number(targetDate);
				}
			}
		}

		if (!selected_date) {
			return await message.sendMessage(`неверная дата.`);
		}

		let keyboard_data = [
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

		if (new Date(selected_date).getDay() === 0) {
			return await message.sendMessage(
				`${await utils.time.getDateByMS(selected_date)} воскресенье.`,
				{ keyboard: Keyboard.keyboard(keyboard_data).inline() },
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
		let lessons_string = ``;
		let selected_week_string;
		let array_with_lessons: any = [];
		let replacement_keyboard = [];
		let user_specialty: any = await models.specialty.findOne({
			id: group_data.specialty_id,
		});

		let user_group = await user_specialty.groups.find(
			(x: any) => x.uid === group_data.uid,
		);

		let selected_day = await user_group.weekly_schedule.find(
			(x: any) => x.num === new Date(selected_date).getDay(),
		);

		let timetable: any = await mpt.parse_timetable();
		if (
			timetable.find(
				(x: any) =>
					x.num === selected_day.lessons[selected_day.lessons.length - 1].num &&
					x.lesson === true,
			).status === `finished` &&
			!message.args[1]
		) {
			if (new Date(selected_date).getDay() + 1 === 7) {
				selected_day = await user_group.weekly_schedule.find(
					(x: any) => x.num === 1,
				);
				selected_date = Number(
					new Date(selected_date).setDate(
						new Date(selected_date).getDate() + 2,
					),
				);
			} else {
				selected_day = await user_group.weekly_schedule.find(
					(x: any) => x.num === new Date(selected_date).getDay() + 1,
				);
				selected_date = Number(
					new Date(selected_date).setDate(
						new Date(selected_date).getDate() + 1,
					),
				);
			}
		}

		let numerator = await !Number.isInteger(
			new Date(selected_date).getWeek() / 2,
		);

		if (numerator === true) {
			selected_week_string = `Числитель`;
		} else {
			selected_week_string = `Знаменатель`;
		}

		for (let i in selected_day.lessons) {
			if (selected_day.lessons[i].name.length === 1) {
				array_with_lessons.push({
					lesson_num: selected_day.lessons[i].num,
					lesson_name: selected_day.lessons[i].name[0],
					lesson_teacher: selected_day.lessons[i].teacher[0],
				});
			} else {
				if (selected_day.lessons[i].name[0] != `-` && numerator === true) {
					array_with_lessons.push({
						lesson_num: selected_day.lessons[i].num,
						lesson_name: selected_day.lessons[i].name[0],
						lesson_teacher: selected_day.lessons[i].teacher[0],
					});
				} else if (
					selected_day.lessons[i].name[1] != `-` &&
					numerator === false
				) {
					array_with_lessons.push({
						lesson_num: selected_day.lessons[i].num,
						lesson_name: selected_day.lessons[i].name[1],
						lesson_teacher: selected_day.lessons[i].teacher[1],
					});
				}
			}
		}

		let replacement_checker = await models.replacement.exists({
			date: await utils.time.getDateByMS(Number(selected_date)),
			unical_group_id: group_data.uid,
		});

		function sorter(a: any, b: any) {
			if (a.lesson_num > b.lesson_num) return 1;
			if (a.lesson_num < b.lesson_num) return -1;
			return 0;
		}

		if (replacement_checker === true) {
			let replacement_on_this_day_data: any = await models.replacement.find({
				date: await utils.time.getDateByMS(Number(selected_date)),
				unical_group_id: group_data.uid,
			});

			for (let i in replacement_on_this_day_data) {
				let check_lesson = array_with_lessons.find(
					(x: any) =>
						x.lesson_num === replacement_on_this_day_data[i].lesson_num,
				);
				if (!check_lesson) {
					array_with_lessons.push({
						lesson_num: replacement_on_this_day_data[i].lesson_num,
						lesson_name: replacement_on_this_day_data[i].new_lesson_name,
						lesson_teacher: replacement_on_this_day_data[i].new_lesson_teacher,
					});
				} else {
					check_lesson.lesson_name =
						replacement_on_this_day_data[i].new_lesson_name;
					check_lesson.lesson_teacher =
						replacement_on_this_day_data[i].new_lesson_teacher;
				}
			}
			array_with_lessons.sort(sorter);
			for (let i in array_with_lessons) {
				lessons_string += `\n${array_with_lessons[i].lesson_num}. ${array_with_lessons[i].lesson_name}\n(${array_with_lessons[i].lesson_teacher})\n`;
			}
			lessons_string += `\n\nВнимание:\nНа выбранный день есть замена.\nПросмотреть текущие замены можно командой "замены".`;
			replacement_keyboard = [
				Keyboard.textButton({
					label: `Замены`,
					payload: {
						command: `Замены ${await utils.time.getDateByMS(selected_date)}`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			];
			keyboard_data.push(replacement_keyboard);
		} else {
			for (let i in array_with_lessons) {
				lessons_string += `\n${array_with_lessons[i].lesson_num}. ${array_with_lessons[i].lesson_name}\n(${array_with_lessons[i].lesson_teacher})\n`;
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
			`расписание на ${await utils.time.getDateByMS(selected_date)}:
Группа: ${group_data.name}
День: ${getWeekDay(new Date(selected_date))}
Место: ${selected_day.place}
Неделя: ${selected_week_string} (${new Date(selected_date).getWeek()})
${lessons_string}`,
			{ keyboard: Keyboard.keyboard(keyboard_data).inline() },
		);
	},
};
