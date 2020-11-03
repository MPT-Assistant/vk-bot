import { MPTMessage } from "../../plugins/types";
export = {
	regexp: /^(?:ник)\s(.*)$/i,
	process: async (message: MPTMessage) => {
		if (message.args[1].length > 25) {
			return message.sendMessage(`максимальная длина ника 25 символов.`);
		}
		message.user.nickname = message.args[1];
		return message.sendMessage(`Вы успешно сменили ник.`);
	},
};
