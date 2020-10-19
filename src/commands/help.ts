import { MPTMessage } from "../plugins/types";
export = {
	regexp: /^(?:помощь|help|хелп|памаги|начать|памагити|помоги|start|команды)$/i,
	process: async (message: MPTMessage) => {
		return await message.send(
			`Для использования полного функционала бота рекомендуется добавить его в беседу.\nСписок команд:`,
			{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
		);
	},
};
