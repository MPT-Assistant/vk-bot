import { Keyboard } from "vk-io";
import models from "../../plugins/models";
import { MPTMessage } from "../../plugins/types";
export = {
	regexp: /^(?:чат|chat)$/i,
	template: ["чат", "Chat"],
	process: async (message: MPTMessage) => {
		if (!message.chat) {
			return message.sendMessage(
				`команду чат можно использовать только в беседах, удивительно не правда ли?\nВозможно Вы имели в виду команду "профиль".`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: `Профиль`,
								payload: {
									command: `профиль`,
								},
								color: Keyboard.POSITIVE_COLOR,
							}),
						],
					]).inline(),
				},
			);
		}
		let groupData = await models.utilityGroup.findOne({
			uid: message.chat.unical_group_id,
		});
		let groupText = `Группа не установлена`;
		let keyboardData = [
			[
				Keyboard.textButton({
					label: `${
						message.chat.inform === true ? "Отключить" : "Включить"
					} рассылку изменений`,
					payload: {
						command: `изменения ${
							message.chat.inform === true ? "выкл" : "вкл"
						}`,
					},
					color: message.chat.inform
						? Keyboard.NEGATIVE_COLOR
						: Keyboard.POSITIVE_COLOR,
				}),
			],
		];
		if (groupData) {
			groupText = `Привязан к группе: ${groupData.name}`;
			keyboardData;
		}

		return message.sendMessage(
			`информация о чате:
ID: ${message.chat.id}
${groupText}
Информирование о заменах: ${
				message.chat.inform === true ? `Включено` : `Отключено`
			}`,
			{ keyboard: Keyboard.keyboard(keyboardData).inline() },
		);
	},
};
