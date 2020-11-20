import { Keyboard } from "vk-io";
import { MPTMessage } from "../../plugins/types";
import { google } from "../../plugins/google";
import models from "../../plugins/models";
import { gmailUser } from "../../plugins/google/gmail";

export = {
	regexp: /^(?:привязка)$/i,
	template: ["привязка"],
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
			let checkUserData = await models.userGoogle.findOne({
				vk_id: message.senderId,
			});
			if (!checkUserData) {
				return await message.sendMessage(
					`ваш аккаунт Google ещё не привязан к боту.`,
					{
						keyboard: Keyboard.keyboard([
							[
								Keyboard.textButton({
									label: "Привязать аккаунт",
									payload: {
										command: `Привязка`,
									},
									color: Keyboard.POSITIVE_COLOR,
								}),
							],
						]).inline(),
					},
				);
			} else {
				console.log(checkUserData);
			}
		}
	},
};
