import { Keyboard } from "vk-io";
import { MPTMessage } from "../../plugins/types";
import utils from "rus-anonym-utils";

import models from "../../plugins/models";

export = {
	regexp: [/^(?:regchat)\s?([^]+)?/i, /^(?:regchat)\s(.*)$/i],
	template: ["regchat"],
	process: async (message: MPTMessage) => {
		if (!message.chat) {
			return message.sendMessage(
				`доступно только в беседах.\nВозможно Вы хотели установить свою группу, для этого можно воспользоваться командой: "установить группу".`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: `Установить группу`,
								payload: {
									command: `Установить группу`,
								},
								color: Keyboard.POSITIVE_COLOR,
							}),
						],
					]).inline(),
				},
			);
		}
		let group_name: any;
		if (!message.args[1]) {
			let answer = await message.question(`Введите Вашу группу:`);
			if (!answer.text) {
				return await message.sendMessage(`неверное название группы.`);
			}
			group_name = answer.text;
		} else {
			group_name = message.args[1];
		}
		let all_groups: any = await models.utilityGroup.find(
			{},
			{ name: 1, uid: 1, specialty: 1 },
		);
		let group_data: any = all_groups.find(
			(x: any) => x.name.toLowerCase() === group_name.toLowerCase(),
		);
		if (!group_data) {
			let diff = [];
			for (let i in all_groups) {
				diff.push({
					group_name: all_groups[i].name,
					diff: await utils.string.levenshtein(
						group_name.toLowerCase(),
						all_groups[i].name.toLowerCase(),
					),
				});
			}
			diff.sort(function (a, b) {
				if (a.diff > b.diff) {
					return 1;
				}
				if (a.diff < b.diff) {
					return -1;
				}
				return 0;
			});
			let text = `\nВозможно вы имели в виду какую то из этих групп:`;
			let keyboard_data = await Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: diff[0].group_name,
						payload: {
							command: `regchat ${diff[0].group_name}`,
						},
						color: Keyboard.POSITIVE_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[1].group_name,
						payload: {
							command: `regchat ${diff[1].group_name}`,
						},
						color: Keyboard.SECONDARY_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[2].group_name,
						payload: {
							command: `regchat ${diff[2].group_name}`,
						},
						color: Keyboard.NEGATIVE_COLOR,
					}),
				],
			]).inline();
			for (let i = 0; i < 3; i++) {
				text += `\n${i + 1}. ${diff[i].group_name}`;
			}
			return await message.sendMessage(
				`группы ${group_name} не найдено, попробуйте ещё раз.${text}`,
				{ keyboard: keyboard_data },
			);
		}
		message.chat.unical_group_id = group_data.uid;
		return await message.sendMessage(
			`Вы привязали беседу к группе ${group_data.name}.\n(${group_data.specialty})`,
		);
	},
};
