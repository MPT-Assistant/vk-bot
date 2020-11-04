import { getRandomId } from "vk-io";
import { vk } from "../../plugins/core";
import { MPTMessage } from "../../plugins/types";
export = {
	regexp: /^(?:report|репорт|предложение)$/i,
	process: async (message: MPTMessage) => {
		let answer = await message.question(
			`Введите текст репорта:`,
			Object.assign({
				disable_mentions: true,
				forward: JSON.stringify({
					peer_id: message.peerId,
					conversation_message_ids: message.conversationMessageId,
					is_reply: 1,
				}),
			}),
		);
		if (!answer.text) {
			return await message.sendMessage(`Вы не указали текст :С.`);
		} else {
			await message.sendMessage(`Ваш репорт отправлен`);
			return await vk.api.messages.send({
				chat_id: 1,
				random_id: getRandomId(),
				message: `@id266982306 (rus_anonym), новый репорт:\n\nРепорт: ${answer.text}`,
			});
		}
	},
};
