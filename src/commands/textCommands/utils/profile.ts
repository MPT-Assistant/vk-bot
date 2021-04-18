import { Keyboard } from "vk-io";
import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(/^(?:профиль|проф)$/i, ["Профиль", "Проф"], async (message) => {
	return await message.sendMessage(
		`Ваш профиль:
ID: ${message.user.id}

Группа: ${message.user.data.group || "Не установлена"}
Информирование о заменах: ${
			message.user.data.inform ? "Включено" : "Отключено"
		}`,
		{
			keyboard: Keyboard.builder()
				.inline()
				.textButton({
					label: `${
						message.user.data.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: {
						command: `изменения ${
							message.user.data.inform ? "отключить" : "включить"
						}`,
					},
					color: message.user.data.inform
						? Keyboard.NEGATIVE_COLOR
						: Keyboard.POSITIVE_COLOR,
				}),
		},
	);
});
