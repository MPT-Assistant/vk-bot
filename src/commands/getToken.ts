import { MPTMessage } from "../plugins/types";
import { vk } from "../plugins/core";
import { google } from "../plugins/google";
export = {
	regexp: /^(?:привязка)$/i,
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
			await message.sendMessage(
				`для привязки аккаунта Google к боту, получите токен по ссылке: ${await vk.api.utils.getShortLink(
					{ url: await google.getURLtoGetToken() },
				)} и отправьте его боту.`,
			);
			let token = await message.question(`Токен аккаунта:`);
			await message.sendMessage(`проверяю токен...`);
			try {
				if (token.text) {
					let userData = await google.getUserTokenByTempToken(token.text);
					// Доделать потом
					return await message.sendMessage(`токен указан верно.`);
				} else {
					return await message.sendMessage(`неверно указан токен.`);
				}
			} catch (error) {
				return await message.sendMessage(`неверно указан токен.`);
			}
		}
	},
};
