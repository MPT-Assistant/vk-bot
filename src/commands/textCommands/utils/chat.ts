import { Keyboard } from "vk-io";
import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(/^(?:чат)$/i, ["Чат"], async (message) => {
	if (!message.chat) {
		return await message.sendMessage("доступно только в беседах.");
	}
	return await message.sendMessage(
		`чат #${message.chat.id}:
Группа: ${message.chat.data.group || "Не установлена"}

Информирование о заменах: ${message.chat.data.inform ? "Включено" : "Отключено"}
`,
		{
			keyboard: Keyboard.builder()
				.inline()
				.textButton({
					label: `${
						message.chat.data.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: {
						command: `изменения ${
							message.chat.data.inform ? "отключить" : "включить"
						}`,
					},
					color: message.chat.data.inform
						? Keyboard.NEGATIVE_COLOR
						: Keyboard.POSITIVE_COLOR,
				}),
		},
	);
});
