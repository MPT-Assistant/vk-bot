import { Keyboard } from "vk-io";
import utils from "rus-anonym-utils";

import TextCommand from "../../../lib/utils/classes/textCommand";
import InternalUtils from "../../../lib/utils/classes/utils";

new TextCommand(
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
			let responseText = `\nВозможно вы имели в виду какую то из этих групп:`;
			const responseKeyboard = Keyboard.builder().inline();
			const buttonColors = [
				Keyboard.POSITIVE_COLOR,
				Keyboard.SECONDARY_COLOR,
				Keyboard.NEGATIVE_COLOR,
			];
			for (let i = 0; i < 3; i++) {
				responseKeyboard.callbackButton({
					label: diff[i].group,
					color: buttonColors[i],
					payload: {
						type: "setGroup",
						group: diff[i].group,
					},
				});
				responseKeyboard.row();

				responseText += `\n${i + 1}. ${diff[i].group}`;
			}
			return await message.sendMessage(
				`группы ${message.args[1]} не найдено, попробуйте ещё раз.${responseText}`,
				{ keyboard: responseKeyboard },
			);
		} else {
			message.user.data.group = selectedGroup.name;
			return await message.sendMessage(
				`Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			);
		}
	},
);
