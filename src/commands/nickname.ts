import { MessageContext } from "vk-io";
export = {
	regexp: /^(?:ник)\s(.*)$/i,
	process: async (message: MessageContext) => {
		if (message.args[1].length > 25) {
			return message.sendMessage(`максимальная длина ника 25 символов.`);
		}
		message.user.nickname = message.args[1];
		return message.sendMessage(`Вы успешно сменили ник.`);
	},
};
