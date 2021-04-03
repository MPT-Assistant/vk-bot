import { Keyboard } from "vk-io";
import utils from "rus-anonym-utils";

import Command from "../../../lib/utils/classes/command";
import InternalUtils from "../../../lib/utils/classes/utils";

new Command(
	/(?:установить группу|уг)(?:\s(.*))?$/i,
	["Установить группу", "Уг"],
	async function SetGroupCommand(message) {
		if (!message.args[1]) {
			return await message.sendMessage("укажите название группы");
		}
		const selectedGroup = InternalUtils.mpt.data.groups.find(
			(group) => group.name.toLowerCase() === message.args[1].toLowerCase(),
		);

		if (!selectedGroup) {
			let diff: { group: string; diff: number }[] = [];
			for (let i in InternalUtils.mpt.data.groups) {
				diff.push({
					group: InternalUtils.mpt.data.groups[i].name,
					diff: utils.string.levenshtein(
						message.args[1],
						InternalUtils.mpt.data.groups[i].name,
						{
							replaceCase: 0,
						},
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
			let keyboard_data = Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: diff[0].group,
						payload: {
							command: `установить группу ${diff[0].group}`,
						},
						color: Keyboard.POSITIVE_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[1].group,
						payload: {
							command: `установить группу ${diff[1].group}`,
						},
						color: Keyboard.SECONDARY_COLOR,
					}),
				],
				[
					Keyboard.textButton({
						label: diff[2].group,
						payload: {
							command: `установить группу ${diff[2].group}`,
						},
						color: Keyboard.NEGATIVE_COLOR,
					}),
				],
			]).inline();
			for (let i = 0; i < 3; i++) {
				text += `\n${i + 1}. ${diff[i].group}`;
			}
			return await message.sendMessage(
				`группы ${message.args[1]} не найдено, попробуйте ещё раз.${text}`,
				{ keyboard: keyboard_data },
			);
		} else {
			message.user.data.group = selectedGroup.name;
			return await message.sendMessage(
				`Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			);
		}
	},
);
