import { getRandomId, Keyboard } from "vk-io";
import moment from "moment";
import "moment-precise-range-plugin";
import parser from "cheerio";
import temp_requester from "request-promise";
import utils from "rus-anonym-utils";
import models from "./models";
import { vk } from "./core";

const timetable = require(`../DB/timetable.json`);

const internalUtils = {
	getUpperLetter: async (str: string) => {
		let array_with_str = str.split(``);
		let data = `ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ`.split(``);
		let temp_array = [];
		for (let i in array_with_str) {
			for (let j in data) {
				if (array_with_str[i].indexOf(data[j]) != -1) {
					temp_array.push({
						letter: array_with_str[i],
						index: i,
					});
				}
			}
		}
		return temp_array;
	},
};

const mpt = {
	Update_all_shedule: async () => {
		const $ = parser.load(
			await temp_requester(`https://mpt.ru/studentu/raspisanie-zanyatiy/`),
		);
		let array_with_all_flow: any = $(
			`body > div.page > main > div > div > div:nth-child(3) > div.col-xs-12.col-sm-12.col-md-7.col-md-pull-5 > div.tab-content`,
		)
			.children()
			.toArray();
		let counter_specialty = 0;
		let counter_group = 0;
		for (let i in array_with_all_flow) {
			counter_specialty += 1;
			let specialty_name = await array_with_all_flow[
				i
			].children[1].children[0].data.replace(`Расписание занятий для `, ``);
			let specialty: any = await models.specialty.findOne({
				id: counter_specialty,
				name: specialty_name,
			});
			if (!specialty) {
				specialty = await new models.specialty({
					id: counter_specialty,
					name: specialty_name,
					groups: [],
				});
			}
			let specialty_group_counter = 0;
			for (
				let j = 1;
				j < array_with_all_flow[i].children[3].children.length;
				j += 2
			) {
				let group_name = await array_with_all_flow[i].children[3].children[
					j
				].children[1].children[0].data
					.replace(/(^\s*)|(\s*)$/g, "")
					.split(`, `);
				for (let c in group_name) {
					counter_group += 1;
					specialty_group_counter += 1;
					let current_group: any = {
						id: specialty_group_counter,
						uid: counter_group,
						name: group_name[c],
						weekly_schedule: [],
					};
					let array_with_days_on_week = array_with_all_flow[
						i
					].children[5].children[j].children[3].children.filter(
						(x: any) => x.type != `text`,
					);
					for (let k = 1; k < array_with_days_on_week.length; k += 2) {
						let day_name =
							array_with_days_on_week[k].children[1].children[0].children[1]
								.children[0].data;
						let place_name: any =
							array_with_days_on_week[k].children[1].children[0].children[1]
								.children[1];
						if (!place_name) break;
						if (place_name.children[0]) {
							place_name = place_name.children[0].data
								.replace(`(`, ``)
								.replace(`)`, ``);
						} else {
							place_name = `Не указано`;
						}
						let array_with_data_lesson = array_with_days_on_week[
							k + 1
						].children.filter((x: any) => x.type != `text`);
						current_group.weekly_schedule.push({
							num: Number(
								day_name
									.toString()
									.replace(/понедельник/gi, 1)
									.replace(/вторник/gi, 2)
									.replace(/среда/gi, 3)
									.replace(/четверг/gi, 4)
									.replace(/пятница/gi, 5)
									.replace(/суббота/gi, 6)
									.replace(/воскресенье/gi, 0),
							),
							place: place_name,
							lessons: [],
						});
						let current_day =
							current_group.weekly_schedule[
								current_group.weekly_schedule.length - 1
							];
						for (let x = 1; x < array_with_data_lesson.length; x++) {
							if (array_with_data_lesson[x].children[0].children) {
								let temp_array_with_num_lesson =
									array_with_data_lesson[x].children[0].children;
								let temp_array_with_name_lesson =
									array_with_data_lesson[x].children[1].children;
								let temp_array_with_teacher_name =
									array_with_data_lesson[x].children[2].children;
								let num_lesson = temp_array_with_num_lesson[0].data;
								let name_lesson = [];
								let teacher_name = [];
								if (temp_array_with_name_lesson[0].data) {
									name_lesson.push(temp_array_with_name_lesson[0].data);
									if (temp_array_with_teacher_name[0]) {
										teacher_name.push(temp_array_with_teacher_name[0].data);
									} else {
										teacher_name.push(`Отсутствует`);
									}
								} else {
									let one_lesson = temp_array_with_name_lesson.find(
										(x: any) => x.attribs.class == `label label-danger`,
									);
									let two_lesson = temp_array_with_name_lesson.find(
										(x: any) => x.attribs.class == `label label-info`,
									);
									let one_teacher = temp_array_with_teacher_name.find(
										(x: any) => x.attribs.class == `label label-danger`,
									);
									let two_teacher = temp_array_with_teacher_name.find(
										(x: any) => x.attribs.class == `label label-info`,
									);
									name_lesson.push(
										one_lesson.children[0].data.replace(/(^\s*)|(\s*)$/g, ""),
									);
									name_lesson.push(
										two_lesson.children[0].data.replace(/(^\s*)|(\s*)$/g, ""),
									);
									teacher_name.push(
										one_teacher.children[0].data.replace(/(^\s*)|(\s*)$/g, ""),
									);
									teacher_name.push(
										two_teacher.children[0].data.replace(/(^\s*)|(\s*)$/g, ""),
									);
								}
								current_day.lessons.push({
									num: Number(num_lesson),
									name: name_lesson,
									teacher: teacher_name,
								});
							}
						}
					}
					let group_in_database = specialty.groups.find(
						(x: any) => x.id === current_group.id,
					);
					if (!group_in_database) {
						specialty.groups.push(current_group);
					} else {
						group_in_database.weekly_schedule = current_group.weekly_schedule;
					}

					let check_utility_group: any = await models.utilityGroup.findOne({
						uid: current_group.uid,
					});
					if (!check_utility_group) {
						check_utility_group = await new models.utilityGroup({
							uid: current_group.uid,
							name: current_group.name,
							id: current_group.id,
							specialty: specialty.name,
							specialty_id: specialty.id,
						});
					} else {
						check_utility_group.name = current_group.name;
						check_utility_group.id = current_group.id;
						check_utility_group.specialty = specialty.name;
						check_utility_group.specialty_id = specialty.id;
					}
					await check_utility_group.save();
				}
			}
			await specialty.save();
		}
		return true;
	},
	Update_all_replacements: async () => {
		const $ = parser.load(
			await temp_requester(`https://mpt.ru/studentu/izmeneniya-v-raspisanii/`),
		);
		let table_with_replacements = $(
			`body > div.page > main > div > div > div:nth-child(3)`,
		);
		let array_with_replacement: any = await table_with_replacements
			.children()
			.toArray();
		let new_array_with_replacement: any = [];
		let current_day = 0;
		for (let i = 1; i < array_with_replacement.length; i++) {
			if (
				array_with_replacement[i].children.length != 0 &&
				array_with_replacement[i].children[0].data ===
					`На ближайшее время замен нет`
			)
				return true;
			let tag = array_with_replacement[i].tagName;
			if (tag == `h4`) {
				current_day += 1;
				new_array_with_replacement.push({
					id: current_day,
					day_data: new Date(
						array_with_replacement[i].children[1].children[0].data
							.split(`.`)
							.reverse()
							.join(`-`),
					),
					data: [],
				});
			} else if (
				tag == `div` &&
				array_with_replacement[i].children[1].tagName === `table`
			) {
				let data = new_array_with_replacement.find(
					(x: any) => x.id === current_day,
				);
				data.data.push(array_with_replacement[i].children[1]);
			}
		} //вывод в массив нужных параметров
		let new_replacement_data: any = [];
		for (let i in new_array_with_replacement) {
			let date_of_replacement = new_array_with_replacement[i].day_data; //получает дату
			let temp_time_data: any = await utils.time.getDateByMS(
				Number(date_of_replacement),
			);
			if (
				!(await new_replacement_data.find((x: any) => x.day === temp_time_data))
			) {
				new_replacement_data.push({
					day: temp_time_data,
					groups: [],
				});
			}
			let current_Date_replacement_data: any = await new_replacement_data.find(
				(x: any) => x.day === temp_time_data,
			);
			for (let j in new_array_with_replacement[i].data) {
				let temp_array_with_replacements = [];
				for (
					let k = 2;
					k <
					new_array_with_replacement[i].data[j].childNodes[3].childNodes.length;
					k += 2
				) {
					let replacing_lesson =
						new_array_with_replacement[i].data[j].childNodes[3].childNodes[k]
							.childNodes[3].children[0].data; //заменяемая пара
					let replace_lesson =
						new_array_with_replacement[i].data[j].childNodes[3].childNodes[k]
							.childNodes[5].children[0].data; //на что заменяют
					let num_lesson =
						new_array_with_replacement[i].data[j].childNodes[3].childNodes[k]
							.childNodes[1].children[0].data; //номер пары
					let text_date_time_replace =
						new_array_with_replacement[i].data[j].childNodes[3].childNodes[k]
							.childNodes[7].children[0].data;
					let update_replace = new Date(
						text_date_time_replace
							.split(` `)[0]
							.split(`.`)
							.reverse()
							.join(`-`) +
							` ` +
							text_date_time_replace.split(` `)[1],
					); //время обновления
					let out = {
						lesson_name: replacing_lesson,
						new_lesson_name: replace_lesson,
						lesson_num: Number(num_lesson),
						detected: new Date(),
						add_to_site: update_replace,
					};
					temp_array_with_replacements.push(out);
				} // обработка замен у группы
				let temp_change = {
					group: new_array_with_replacement[i].data[
						j
					].children[0].next.children[0].next.children[0].data.split(`, `),
					replacements: temp_array_with_replacements,
				};
				for (let g in temp_change.group) {
					let new_temp_current_Date_replacement_data: any = current_Date_replacement_data.groups.find(
						(x: any) =>
							x.group_name.toLowerCase() ===
							temp_change.group[g].toLowerCase().replace(/(^\s*)|(\s*)$/g, ""),
					);
					if (!new_temp_current_Date_replacement_data) {
						let group_data: any = await models.utilityGroup.findOne({
							name: new RegExp(
								temp_change.group[g]
									.toLowerCase()
									.replace(/(^\s*)|(\s*)$/g, ""),
								`gi`,
							),
						});
						if (!group_data) continue;
						current_Date_replacement_data.groups.push({
							group_name: group_data.name,
							group_id: group_data.id,
							unical_group_id: group_data.uid,
							flow_id: group_data.specialty_id,
							flow_name: group_data.specialty,
							replacements: [],
						});
						new_temp_current_Date_replacement_data = current_Date_replacement_data.groups.find(
							(x: any) => x.group_name === group_data.name,
						);
					}
					for (let c in temp_change.replacements) {
						let lesson_name = temp_change.replacements[c].lesson_name.replace(
							/(^\s*)|(\s*)$/g,
							"",
						);
						let new_lesson_name: any = temp_change.replacements[
							c
						].new_lesson_name.replace(/(^\s*)|(\s*)$/g, "");
						let teacher_name = `Отсутствует`;
						let new_teacher_name = `Отсутствует`;
						let temp_array_lesson_name_with_upper_letter: any,
							temp_array_new_lesson_name_with_upper_letter: any;
						if (
							lesson_name != `ПРАКТИКА` ||
							lesson_name != `ДЕНЬ САМОПОДГОТОВКИ`
						) {
							temp_array_lesson_name_with_upper_letter = await internalUtils.getUpperLetter(
								lesson_name,
							);
						}
						if (
							new_lesson_name != `ПРАКТИКА` ||
							new_lesson_name != `ДЕНЬ САМОПОДГОТОВКИ`
						) {
							temp_array_new_lesson_name_with_upper_letter = await internalUtils.getUpperLetter(
								new_lesson_name,
							);
						}
						if (temp_array_lesson_name_with_upper_letter.length > 1) {
							teacher_name = lesson_name
								.substring(
									Number(temp_array_lesson_name_with_upper_letter[1].index),
								)
								.replace(/(^\s*)|(\s*)$/g, "");
							lesson_name = lesson_name
								.substring(
									0,
									Number(temp_array_lesson_name_with_upper_letter[1].index),
								)
								.replace(/(^\s*)|(\s*)$/g, "");
						}
						if (temp_array_new_lesson_name_with_upper_letter.length > 1) {
							new_teacher_name = new_lesson_name
								.substring(
									Number(temp_array_new_lesson_name_with_upper_letter[1].index),
								)
								.replace(/(^\s*)|(\s*)$/g, "");
							new_lesson_name = new_lesson_name
								.substring(
									0,
									Number(temp_array_new_lesson_name_with_upper_letter[1].index),
								)
								.replace(/(^\s*)|(\s*)$/g, "");
						}
						new_temp_current_Date_replacement_data.replacements.push({
							detected: temp_change.replacements[c].detected,
							add_to_site: temp_change.replacements[c].add_to_site,
							lesson_num: temp_change.replacements[c].lesson_num,
							old_lesson_name: lesson_name,
							old_teacher_name: teacher_name,
							new_lesson_name: new_lesson_name,
							new_teacher_name: new_teacher_name,
						});
					}
				}
			} //обработка групп
		} //обработка нескольких дней

		for (let i in new_replacement_data) {
			for (let j in new_replacement_data[i].groups) {
				for (let c in new_replacement_data[i].groups[j].replacements) {
					let parsed_data: {
						date: Date;
						unical_group_id: number;
						specialty_id: number;
						group_id: number;
						detected: number;
						add_to_site: number;
						lesson_num: number;
						old_lesson_name: string;
						old_lesson_teacher: string;
						new_lesson_name: string;
						new_lesson_teacher: string;
					} = {
						date: new_replacement_data[i].day,
						unical_group_id: new_replacement_data[i].groups[j].unical_group_id,
						specialty_id: new_replacement_data[i].groups[j].flow_id,
						group_id: new_replacement_data[i].groups[j].group_id,
						detected:
							new_replacement_data[i].groups[j].replacements[c].detected,
						add_to_site:
							new_replacement_data[i].groups[j].replacements[c].add_to_site,
						lesson_num:
							new_replacement_data[i].groups[j].replacements[c].lesson_num,
						old_lesson_name:
							new_replacement_data[i].groups[j].replacements[c].old_lesson_name,
						old_lesson_teacher:
							new_replacement_data[i].groups[j].replacements[c]
								.old_teacher_name,
						new_lesson_name:
							new_replacement_data[i].groups[j].replacements[c].new_lesson_name,
						new_lesson_teacher:
							new_replacement_data[i].groups[j].replacements[c]
								.new_teacher_name,
					};

					if (
						!(await models.replacement.exists({
							date: parsed_data.date,
							unical_group_id: parsed_data.unical_group_id,
							add_to_site: parsed_data.add_to_site,
							lesson_num: parsed_data.lesson_num,
						}))
					) {
						await new models.replacement(parsed_data).save();
						let chatsWithInformThisGroups = await models.chat.find({
							unical_group_id: parsed_data.unical_group_id,
							inform: true,
						});
						for (let chat of chatsWithInformThisGroups) {
							try {
								await vk.api.messages.send({
									chat_id: chat.id,
									message: `Обнаружена новая замена на ${
										parsed_data.date
									}\nПара: ${parsed_data.lesson_num}\nЗаменяемая пара: ${
										parsed_data.old_lesson_name
									}\nПреподаватель: ${
										parsed_data.old_lesson_teacher
									}\nНовая пара: ${
										parsed_data.new_lesson_name
									}\nПреподаватель на новой паре: ${
										parsed_data.new_lesson_teacher
									}\nДобавлена на сайт: ${await utils.time.getDateTimeByMS(
										parsed_data.add_to_site,
									)}\nОбнаружена ботом: ${await utils.time.getDateTimeByMS(
										parsed_data.detected,
									)}\n\n`,
									random_id: getRandomId(),
								});
							} catch (error) {}
						}
					}
				}
			}
		}

		return true;
	},
	parseTimetable: async () => {
		let output = [];
		let lessonNum = 0;
		let breakNum = 0;
		for (let i in timetable) {
			let startLessonDate = new Date();
			let endLessonDate = new Date();
			let status = `not_start`;
			startLessonDate.setHours(timetable[i].start.hour);
			startLessonDate.setMinutes(timetable[i].start.minute);
			startLessonDate.setSeconds(0);
			endLessonDate.setHours(timetable[i].end.hour);
			endLessonDate.setMinutes(timetable[i].end.minute);
			endLessonDate.setSeconds(0);
			if (startLessonDate < new Date()) {
				startLessonDate.setDate(new Date().getDate() + 1);
				status = `started`;
			}
			if (endLessonDate < new Date()) {
				endLessonDate.setDate(new Date().getDate() + 1);
				status = `finished`;
			}
			let output_data = {
				lesson: timetable[i].lesson,
				start: startLessonDate,
				end: endLessonDate,
				status: status,
				diff_start: moment.preciseDiff(
					moment(new Date()),
					moment(new Date(startLessonDate)),
					true,
				),
				diff_end: moment.preciseDiff(
					moment(new Date()),
					moment(new Date(endLessonDate)),
					true,
				),
			};
			if (timetable[i].lesson === true) {
				lessonNum += 1;
				output.push(Object.assign(output_data, { num: lessonNum }));
			} else {
				breakNum += 1;
				output.push(Object.assign(output_data, { num: breakNum }));
			}
		}
		return output;
	},
};

export { mpt };
