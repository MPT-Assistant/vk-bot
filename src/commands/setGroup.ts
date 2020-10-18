import { MessageContext, Keyboard } from "vk-io";
import models from "../plugins/models";
import utils from "rus-anonym-utils";

module.exports = {
	regexp: /^(?:установить группу|уг)\s?([^]+)?/i,
	process: async (message: MessageContext) => {
		let group_name: any;
		if (!message.args[1]) {
			let answer = await message.question(`Введите Вашу группу:`);
			if (!answer.text) {
				return await message.send_message(`неверное название группы.`);
			}
			group_name = answer.text;
		} else {
			group_name = message.args[1];
		}
		let all_groups: any = await models.utility_group.find(
			{},
			{ name: 1, uid: 1, specialty: 1 },
		);
		let group_data = all_groups.find(
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
							command: `установить группу ${diff[0].group_name}`,
						},
						color: Keyboard.POSITIVE_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[1].group_name,
						payload: {
							command: `установить группу ${diff[1].group_name}`,
						},
						color: Keyboard.SECONDARY_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[2].group_name,
						payload: {
							command: `установить группу ${diff[2].group_name}`,
						},
						color: Keyboard.NEGATIVE_COLOR,
					}),
				],
			]).inline();
			for (let i = 0; i < 3; i++) {
				text += `\n${i + 1}. ${diff[i].group_name}`;
			}
			return await message.send_message(
				`группы ${group_name} не найдено, попробуйте ещё раз.${text}`,
				{ keyboard: keyboard_data },
			);
		}
		message.user.data.unical_group_id = group_data.uid;
		return await message.send_message(
			`Вы установили себе группу ${group_data.name}.\n(${group_data.specialty})`,
		);
	},
};
