import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(
	/^(?:помощь|help|start|команды)$/i,
	["Помощь", "Команды"],
	async (message) => {
		return await message.sendMessage(
			`${
				!message.isChat
					? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
					: ""
			}Список команд:`,
			{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
		);
	},
);
