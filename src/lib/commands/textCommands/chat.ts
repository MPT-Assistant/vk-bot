import { Keyboard } from "vk-io";
import TextCommand from "../../utils/TextCommand";

new TextCommand({
	alias: /^(?:чат)$/i,
	process: (message) => {
		if (!message.state.chat) {
			return message.state.sendMessage("доступно только в беседах.");
		}

		const keyboard = Keyboard.builder().textButton({
			label: `${
				message.state.chat.inform ? "Отключить" : "Включить"
			} уведомления`,
			payload: {
				command: `изменения ${
					message.state.chat.inform ? "отключить" : "включить"
				}`,
			},
			color: message.state.chat.inform
				? Keyboard.NEGATIVE_COLOR
				: Keyboard.POSITIVE_COLOR,
		});

		return message.state.sendMessage(
			`чат #${message.state.chat.id}:
Группа: ${message.state.chat.group || "Не установлена"}
Информирование о заменах: ${
				message.state.chat.inform ? "Включено" : "Отключено"
			}
`,
			{
				keyboard: keyboard.inline(),
			},
		);
	},
});
