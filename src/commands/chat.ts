import { Keyboard } from "vk-io";
import models from "../plugins/models";
import { MPTMessage } from "../plugins/types";
export = {
	regexp: /^(?:чат|chat)$/i,
	process: async (message: MPTMessage) => {
		if (!message.chat) {
			return message.sendMessage(
				`команду чат можно использовать только в беседах, удивительно не правда ли?`,
			);
		}
		let groupData: any = await models.utilityGroup.findOne({
			uid: message.chat.unical_group_id,
		});
		let keyboardData = [
			[
				Keyboard.textButton({
					label: `${
						groupData.inform ? "Отключить" : "Включить"
					} рассылку изменений`,
					payload: {
						command: `изменения ${groupData.inform ? "выкл" : "вкл"}`,
					},
					color: groupData.inform
						? Keyboard.POSITIVE_COLOR
						: Keyboard.NEGATIVE_COLOR,
				}),
			],
		];
		return message.sendMessage(
			`информация о чате:
ID: ${message.chat.id}
Привязан к группе: ${groupData.name}
Информирование о заменах: ${groupData.inform ? `Включено` : `Отключено`}`,
			{ keyboard: Keyboard.keyboard(keyboardData).inline() },
		);
	},
};
