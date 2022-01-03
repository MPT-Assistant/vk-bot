import { Keyboard } from "vk-io";

import TextCommand from "../../../utils/TextCommand";
import DB from "../../../DB";

new TextCommand({
	alias: /^(?:профиль|проф)$/i,
	process: async (context) => {
		if (!context.state.user.group) {
			return context.state.sendMessage(
				`Ваш профиль:
ID: ${context.senderId}
Группа: Не установлена`,
			);
		}

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

		const group = await DB.api.models.group.findOne({
			name: context.state.user.group,
		});

		if (!group) {
			context.state.user.group = "";
			return context.state.sendMessage(
				`Попробуйте заново установить вашу группу`,
			);
		}

		const specialty = await DB.api.models.specialty.findOne({
			code: group.specialty,
		});

		if (!specialty) {
			return context.state.sendMessage(
				`Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group}
Информирование о заменах: ${
					context.state.user.inform ? "Включено" : "Отключено"
				}`,
				{
					keyboard: keyboard.inline(),
				},
			);
		}

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		keyboard.row().urlButton({
			label: "Сайт отделения",
			url: specialty.url,
		});

		return context.state.sendMessage(
			`Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group}
Отделение: ${specialty.name}
${
	groupLeaders
		? `\nАктив группы:\n` +
		  groupLeaders.roles
				.map((item, index) => `${index + 1}. ${item.role} - ${item.name}`)
				.join("\n")
		: ""
}

Информирование о заменах: ${
				context.state.user.inform ? "Включено" : "Отключено"
			}`,
			{
				keyboard: keyboard.inline(),
			},
		);
	},
});
