import { Keyboard } from "vk-io";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:профиль|проф)$/i,
	process: (context) => {
		const keyboard = Keyboard.builder().textButton({
			label: `${
				context.state.user.inform ? "Отключить" : "Включить"
			} уведомления`,
			payload: {
				command: `изменения ${
					context.state.user.inform ? "отключить" : "включить"
				}`,
			},
			color: context.state.user.inform
				? Keyboard.NEGATIVE_COLOR
				: Keyboard.POSITIVE_COLOR,
		});

		return context.state.sendMessage(
			`Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group || "Не установлена"}
Информирование о заменах: ${
				context.state.user.inform ? "Включено" : "Отключено"
			}`,
			{
				keyboard: keyboard.inline(),
			},
		);
	},
});
