import { MPTMessage } from "../plugins/types";
export = {
	regexp: /^(?:привязка)$/i,
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
            
		}
	},
};
