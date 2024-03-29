import { Keyboard } from "vk-io";
import utils from "rus-anonym-utils";

import TextCommand from "../../../utils/TextCommand";
import DB from "../../../DB";

new TextCommand({
	alias: /(?:установить группу|уг)(?:\s(.*))?$/i,
	process: async (message) => {
		if (!message.state.args[1]) {
			return await message.state.sendMessage("укажите название группы");
		}
		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${message.state.args[1]}$`, "i"),
		});

		if (!selectedGroup) {
			const diff: { group: string; diff: number }[] = [];
			for await (const group of DB.api.models.group
				.find({})
				.select({ name: 1 })) {
				diff.push({
					group: group.name,
					diff: utils.string.levenshtein(message.state.args[1], group.name, {
						replaceCase: 0,
					}),
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
			for (let i = 0; i < 3; ++i) {
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
			return await message.state.sendMessage(
				`группы ${message.state.args[1]} не найдено, попробуйте ещё раз.${responseText}`,
				{ keyboard: responseKeyboard },
			);
		} else {
			message.state.user.group = selectedGroup.name;
			return await message.state.sendMessage(
				`Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			);
		}
	},
});
