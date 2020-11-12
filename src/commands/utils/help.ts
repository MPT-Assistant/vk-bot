import { MPTMessage } from "../../plugins/types";
export = {
	regexp: [/^(?:помощь|help|start|команды)$/i],
	template: ["помощь", "help", "команды"],
	process: async (message: MPTMessage) => {
		return await message.sendMessage(
			`${
				!message.isChat
					? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
					: ""
			}Список команд:`,
			{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
		);
	},
};
