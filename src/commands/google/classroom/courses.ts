import { Keyboard } from "vk-io";
import { MPTMessage } from "../../plugins/types";
import models from "../../plugins/models";
import { classroomUser } from "../../plugins/google/classroom";

export = {
	regexp: /^(?:Classroom)$/i,
	template: ["Classroom"],
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
			let userGoogleAccount = await models.userGoogle.findOne({
				vk_id: message.senderId,
			});
			if (!userGoogleAccount) {
				return message.sendMessage(
					`Вы ещё не привязали свой аккаунт Google к боту.`,
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
			}
			return message.sendMessage(
				`Ваш профиль:
Account: ${userGoogleAccount.email}`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: "Мои курсы",
								payload: {
									command: `Мои курсы`,
								},
								color: Keyboard.POSITIVE_COLOR,
							}),
						],
					]).inline(),
				},
			);
		}
	},
};
