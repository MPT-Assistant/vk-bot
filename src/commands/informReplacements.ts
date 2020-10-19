import { MPTMessage } from "../plugins/types";
export = {
	regexp: /^(?:изменения)\s(вкл|выкл|выключить|включить)$/i,
	process: async (message: MPTMessage) => {
		if (!message.chat) {
			return message.sendMessage(
				`команду можно использовать только в беседах.`,
			);
		}
		if (
			message.args[1].toLowerCase() === "вкл" ||
			message.args[1].toLowerCase() === `включить`
		) {
			message.chat.inform = true;
			return await message.send_message(
				`рассылка изменений в расписании группы включена!`,
			);
		}

		if (
			message.args[1].toLowerCase() === "выкл" ||
			message.args[1].toLowerCase() === `выключить`
		) {
			message.chat.inform = false;
			return await message.send_message(
				`рассылка изменений в расписании группы отключена!`,
			);
		}
	},
};
