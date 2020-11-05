import utils from "rus-anonym-utils";
import { MPTMessage } from "../../plugins/types";
import { Keyboard } from "vk-io";

import models from "../../plugins/models";

export = {
	regexp: /^(?:замены)\s?([^]+)?/i,
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
		let selected_date;
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
		if (
			!message.args[1] ||
			/(?:^сегодня|с)$/gi.test(message.args[1]) === true
		) {
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
			if (!data[1]) {
				data[1] = (await utils.time.currentDate()).split(`.`)[1];
			}
			if (!data[2]) {
				data[2] = (await utils.time.currentDate()).split(`.`)[2];
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

		let replacement_checker = await models.replacement.exists({
			date: await utils.time.getDateByMS(Number(selected_date)),
			unical_group_id: group_data.uid,
		});

		let keyboard_data = [
			[
				Keyboard.textButton({
					label: "ПН",
					payload: {
						command: `Замены понедельник`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "ВТ",
					payload: {
						command: `Замены вторник`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "СР",
					payload: {
						command: `Замены Среда`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			],
			[
				Keyboard.textButton({
					label: "ЧТ",
					payload: {
						command: `Замены четверг`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "ПТ",
					payload: {
						command: `Замены пятница`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "СБ",
					payload: {
						command: `Замены суббота`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
			],
			[
				Keyboard.textButton({
					label: "Вчера",
					payload: {
						command: `Замены вчера`,
					},
					color: Keyboard.NEGATIVE_COLOR,
				}),
				Keyboard.textButton({
					label: "Сегодня",
					payload: {
						command: `Замены`,
					},
					color: Keyboard.SECONDARY_COLOR,
				}),
				Keyboard.textButton({
					label: "Завтра",
					payload: {
						command: `Замены завтра`,
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

		if (replacement_checker === false) {
			return message.sendMessage(
				`на ${await utils.time.getDateByMS(selected_date)} нет замен.`,
				{ keyboard: Keyboard.keyboard(keyboard_data).inline() },
			);
		}

		let replacement_on_this_day_data: any = await models.replacement.find({
			date: await utils.time.getDateByMS(Number(selected_date)),
			unical_group_id: group_data.uid,
		});

		let replacements_string = `для Вашей группы ${
			group_data.name
		} на ${await utils.time.getDateByMS(selected_date)} найдено ${
			replacement_on_this_day_data.length
		} ${await utils.string.declOfNum(replacement_on_this_day_data.length, [
			`замена`,
			`замены`,
			`замен`,
		])}.\n\n`;

		for (let i in replacement_on_this_day_data) {
			replacements_string += `Замена #${Number(i) + 1}\nПара: ${
				replacement_on_this_day_data[i].lesson_num
			}\nЗаменяемая пара: ${
				replacement_on_this_day_data[i].old_lesson_name
			}\nПреподаватель: ${
				replacement_on_this_day_data[i].old_lesson_teacher
			}\nНовая пара: ${
				replacement_on_this_day_data[i].new_lesson_name
			}\nПреподаватель на новой паре: ${
				replacement_on_this_day_data[i].new_lesson_teacher
			}\nДобавлена на сайт: ${await utils.time.getDateTimeByMS(
				replacement_on_this_day_data[i].add_to_site,
			)}\nОбнаружена ботом: ${await utils.time.getDateTimeByMS(
				replacement_on_this_day_data[i].detected,
			)}\n\n`;
		}
		return message.sendMessage(replacements_string, {
			keyboard: Keyboard.keyboard(keyboard_data).inline(),
		});
	},
};
