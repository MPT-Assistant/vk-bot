import TextCommand from "../../utils/TextCommand";

new TextCommand({
	alias: /^(?:помощь|help|start|команды)$/i,
	process: (message) => {
		return message.sendMessage(
			`${
				!message.isChat
					? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
					: ""
			}Список команд:`,
			{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
		);
	},
});
