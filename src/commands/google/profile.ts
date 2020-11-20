import { Keyboard } from "vk-io";
import { MPTMessage } from "../../plugins/types";
import models from "../../plugins/models";
import { gmailUser } from "../../plugins/google/gmail";

export = {
	regexp: /^(?:Google|мой аккаунт)$/i,
	template: ["Google", "Мой аккаунт"],
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
		}
	},
};
